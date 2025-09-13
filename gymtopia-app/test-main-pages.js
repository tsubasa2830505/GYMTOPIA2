#!/usr/bin/env node

const { spawn } = require('child_process');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

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

let serverProcess;

async function startServer() {
    console.log('🚀 開発サーバーを起動中...');

    return new Promise((resolve, reject) => {
        serverProcess = spawn('npm', ['run', 'dev'], {
            stdio: ['ignore', 'pipe', 'pipe'],
            env: { ...process.env, PORT: '3000' }
        });

        let output = '';

        const timeout = global.setTimeout(() => {
            reject(new Error('サーバー起動がタイムアウトしました'));
        }, 30000);

        serverProcess.stdout.on('data', (data) => {
            output += data.toString();
            if (output.includes('Ready') || output.includes('Local:')) {
                clearTimeout(timeout);
                resolve();
            }
        });

        serverProcess.stderr.on('data', (data) => {
            const errorOutput = data.toString();
            if (errorOutput.includes('EADDRINUSE')) {
                clearTimeout(timeout);
                resolve(); // ポートが使用中の場合は既にサーバーが起動していると仮定
            }
        });

        serverProcess.on('error', (error) => {
            clearTimeout(timeout);
            reject(error);
        });
    });
}

async function testPage(url) {
    const fullUrl = `http://localhost:3000${url}`;
    console.log(`📄 テスト中: ${fullUrl}`);

    try {
        const { spawn } = require('child_process');

        return new Promise((resolve, reject) => {
            const curl = spawn('curl', [
                '-s',
                '-o', '/dev/null',
                '-w', '%{http_code}:%{time_total}',
                '--max-time', '10',
                '--connect-timeout', '5',
                fullUrl
            ]);

            let output = '';

            curl.stdout.on('data', (data) => {
                output += data.toString();
            });

            curl.on('close', (code) => {
                if (code === 0) {
                    const [statusCode, responseTime] = output.trim().split(':');
                    const time = parseFloat(responseTime) * 1000; // ms変換

                    if (statusCode === '200') {
                        console.log(`✅ ${url}: OK (${time.toFixed(0)}ms)`);
                        resolve({ url, status: 'OK', statusCode, responseTime: time });
                    } else {
                        console.log(`⚠️  ${url}: HTTP ${statusCode} (${time.toFixed(0)}ms)`);
                        resolve({ url, status: 'WARNING', statusCode, responseTime: time });
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

async function runTests() {
    console.log('🧪 GYMTOPIA 主要ページテスト開始\n');

    try {
        await startServer();
        console.log('✅ サーバー起動完了\n');

        // サーバー安定化のため少し待機
        await sleep(3000);

        const results = [];

        // 各ページを順次テスト
        for (const page of testPages) {
            const result = await testPage(page);
            results.push(result);
            await sleep(500); // ページ間の間隔
        }

        // 結果サマリー
        console.log('\n📊 テスト結果サマリー:');
        console.log('=' + '='.repeat(50));

        const okCount = results.filter(r => r.status === 'OK').length;
        const warningCount = results.filter(r => r.status === 'WARNING').length;
        const errorCount = results.filter(r => r.status === 'ERROR').length;

        console.log(`✅ 正常: ${okCount}ページ`);
        console.log(`⚠️  警告: ${warningCount}ページ`);
        console.log(`❌ エラー: ${errorCount}ページ`);

        if (warningCount > 0 || errorCount > 0) {
            console.log('\n🔍 要確認ページ:');
            results.filter(r => r.status !== 'OK').forEach(r => {
                console.log(`   ${r.url}: ${r.status} (HTTP ${r.statusCode})`);
            });
        }

        const avgResponseTime = results
            .filter(r => typeof r.responseTime === 'number')
            .reduce((sum, r) => sum + r.responseTime, 0) /
            results.filter(r => typeof r.responseTime === 'number').length;

        if (avgResponseTime) {
            console.log(`\n⏱️  平均応答時間: ${avgResponseTime.toFixed(0)}ms`);
        }

        console.log('\n🎉 テスト完了');

        return okCount === testPages.length;

    } catch (error) {
        console.error('❌ テスト実行エラー:', error.message);
        return false;
    }
}

// Ctrl+Cでサーバーを停止
process.on('SIGINT', () => {
    console.log('\n🛑 テスト中断中...');
    if (serverProcess) {
        serverProcess.kill();
    }
    process.exit(0);
});

// テスト実行
runTests().then(success => {
    if (serverProcess) {
        serverProcess.kill();
    }
    process.exit(success ? 0 : 1);
});