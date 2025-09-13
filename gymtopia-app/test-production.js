#!/usr/bin/env node

const { promisify } = require('util');
const { spawn } = require('child_process');
const sleep = promisify(setTimeout);

// 本番URL
const PRODUCTION_URL = 'https://gymtopia-2-5akxzcaea-tsubasaa2830505-7621s-projects.vercel.app';

// テスト対象ページ
const testPages = [
    '/',
    '/feed',
    '/admin',
    '/search/results',
    '/add',
    '/gym-stats',
    '/auth/login',
    '/profile'
];

async function testProductionPage(url) {
    const fullUrl = `${PRODUCTION_URL}${url}`;
    console.log(`📄 テスト中: ${fullUrl}`);

    try {
        return new Promise((resolve, reject) => {
            const curl = spawn('curl', [
                '-s',
                '-o', '/dev/null',
                '-w', '%{http_code}:%{time_total}:%{time_connect}',
                '--max-time', '30',
                '--connect-timeout', '10',
                fullUrl
            ]);

            let output = '';

            curl.stdout.on('data', (data) => {
                output += data.toString();
            });

            curl.on('close', (code) => {
                if (code === 0) {
                    const [statusCode, totalTime, connectTime] = output.trim().split(':');
                    const responseTime = parseFloat(totalTime) * 1000;
                    const connectionTime = parseFloat(connectTime) * 1000;

                    if (statusCode === '200') {
                        console.log(`✅ ${url}: OK (${responseTime.toFixed(0)}ms, 接続: ${connectionTime.toFixed(0)}ms)`);
                        resolve({ url, status: 'OK', statusCode, responseTime, connectionTime });
                    } else if (statusCode.startsWith('3')) {
                        console.log(`🔄 ${url}: リダイレクト HTTP ${statusCode} (${responseTime.toFixed(0)}ms)`);
                        resolve({ url, status: 'REDIRECT', statusCode, responseTime, connectionTime });
                    } else {
                        console.log(`⚠️  ${url}: HTTP ${statusCode} (${responseTime.toFixed(0)}ms)`);
                        resolve({ url, status: 'WARNING', statusCode, responseTime, connectionTime });
                    }
                } else {
                    console.log(`❌ ${url}: 接続エラー`);
                    resolve({ url, status: 'ERROR', statusCode: 'N/A', responseTime: 'N/A' });
                }
            });
        });
    } catch (error) {
        console.log(`❌ ${url}: ${error.message}`);
        return { url, status: 'ERROR', error: error.message };
    }
}

async function testSSLCertificate() {
    console.log('🔒 SSL証明書の確認...');

    return new Promise((resolve, reject) => {
        const openssl = spawn('openssl', [
            's_client',
            '-connect', 'gymtopia-2-5akxzcaea-tsubasaa2830505-7621s-projects.vercel.app:443',
            '-servername', 'gymtopia-2-5akxzcaea-tsubasaa2830505-7621s-projects.vercel.app',
            '-verify_return_error'
        ], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';

        // stdin を閉じる
        openssl.stdin.end();

        openssl.stdout.on('data', (data) => {
            output += data.toString();
        });

        openssl.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        const timeout = global.setTimeout(() => {
            openssl.kill();
            resolve({ status: 'SSL_OK', message: 'SSL証明書は有効です' });
        }, 5000);

        openssl.on('close', (code) => {
            clearTimeout(timeout);
            if (output.includes('Verify return code: 0 (ok)') || !errorOutput.includes('verify error')) {
                console.log('✅ SSL証明書: 有効');
                resolve({ status: 'SSL_OK', message: 'SSL証明書は有効です' });
            } else {
                console.log('⚠️  SSL証明書: 警告あり');
                resolve({ status: 'SSL_WARNING', message: 'SSL証明書に軽微な問題があります' });
            }
        });
    });
}

async function runProductionTests() {
    console.log('🧪 GYMTOPIA 本番環境テスト開始');
    console.log(`🌐 テスト対象: ${PRODUCTION_URL}\n`);

    try {
        // SSL証明書テスト
        const sslResult = await testSSLCertificate();
        console.log('');

        const results = [];

        // 各ページを順次テスト
        for (const page of testPages) {
            const result = await testProductionPage(page);
            results.push(result);
            await sleep(1000); // サーバー負荷軽減のため間隔を空ける
        }

        // 結果サマリー
        console.log('\n📊 本番環境テスト結果:');
        console.log('=' + '='.repeat(60));

        const okCount = results.filter(r => r.status === 'OK').length;
        const redirectCount = results.filter(r => r.status === 'REDIRECT').length;
        const warningCount = results.filter(r => r.status === 'WARNING').length;
        const errorCount = results.filter(r => r.status === 'ERROR').length;

        console.log(`✅ 正常: ${okCount}ページ`);
        console.log(`🔄 リダイレクト: ${redirectCount}ページ`);
        console.log(`⚠️  警告: ${warningCount}ページ`);
        console.log(`❌ エラー: ${errorCount}ページ`);

        if (warningCount > 0 || errorCount > 0) {
            console.log('\n🔍 要確認ページ:');
            results.filter(r => r.status === 'WARNING' || r.status === 'ERROR').forEach(r => {
                console.log(`   ${r.url}: ${r.status} (HTTP ${r.statusCode})`);
            });
        }

        // パフォーマンス統計
        const validResults = results.filter(r => typeof r.responseTime === 'number');
        if (validResults.length > 0) {
            const avgResponseTime = validResults.reduce((sum, r) => sum + r.responseTime, 0) / validResults.length;
            const avgConnectionTime = validResults.reduce((sum, r) => sum + r.connectionTime, 0) / validResults.length;

            console.log(`\n⏱️  平均応答時間: ${avgResponseTime.toFixed(0)}ms`);
            console.log(`🔗 平均接続時間: ${avgConnectionTime.toFixed(0)}ms`);
        }

        // 総合評価
        if (okCount === testPages.length && sslResult.status === 'SSL_OK') {
            console.log('\n🎉 本番環境テスト: 完全成功！');
            return true;
        } else if (okCount + redirectCount === testPages.length) {
            console.log('\n✅ 本番環境テスト: 概ね良好');
            return true;
        } else {
            console.log('\n⚠️  本番環境テスト: 要改善項目あり');
            return false;
        }

    } catch (error) {
        console.error('❌ テスト実行エラー:', error.message);
        return false;
    }
}

// テスト実行
runProductionTests().then(success => {
    process.exit(success ? 0 : 1);
});