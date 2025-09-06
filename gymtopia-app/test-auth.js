console.log('🔐 認証機能テスト開始...\n');

const fs = require('fs');

// 認証関数テスト
async function testAuthFunctions() {
  console.log('📋 認証関数分析:');
  
  try {
    const authFile = './src/lib/supabase/auth.ts';
    
    if (!fs.existsSync(authFile)) {
      throw new Error('認証ファイルが存在しません');
    }
    
    const content = fs.readFileSync(authFile, 'utf8');
    
    // 関数分析
    const functions = [];
    const functionRegex = /export\s+(async\s+)?function\s+(\w+)/g;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      functions.push({
        name: match[2],
        isAsync: !!match[1],
        type: 'function'
      });
    }
    
    // const exports
    const constRegex = /export\s+const\s+(\w+)/g;
    while ((match = constRegex.exec(content)) !== null) {
      functions.push({
        name: match[1],
        isAsync: false,
        type: 'const'
      });
    }
    
    console.log(`✅ 認証関数ファイル解析完了: ${functions.length}個の関数`);
    
    // 重要な認証関数をチェック
    const criticalFunctions = [
      'signUp', 'signIn', 'signOut', 'getCurrentUser', 
      'resetPassword', 'updatePassword', 'verifyEmail'
    ];
    
    const foundFunctions = functions.map(f => f.name.toLowerCase());
    
    console.log('\n🔍 重要認証関数チェック:');
    criticalFunctions.forEach(func => {
      const exists = foundFunctions.some(f => f.includes(func.toLowerCase()));
      console.log(`  ${exists ? '✅' : '❌'} ${func}: ${exists ? '実装済み' : '未実装'}`);
    });
    
    // エラーハンドリング分析
    const errorHandling = {
      hasTryCatch: content.includes('try') && content.includes('catch'),
      hasErrorLogging: content.includes('console.error') || content.includes('console.log'),
      hasReturnError: content.includes('return') && content.includes('error'),
      hasThrowError: content.includes('throw')
    };
    
    console.log('\n🛡️ エラーハンドリング分析:');
    Object.entries(errorHandling).forEach(([key, value]) => {
      const label = {
        hasTryCatch: 'Try-Catch',
        hasErrorLogging: 'エラーログ',
        hasReturnError: 'エラー返却',
        hasThrowError: 'エラー投げる'
      }[key];
      console.log(`  ${value ? '✅' : '❌'} ${label}: ${value ? '有り' : '無し'}`);
    });
    
    // Supabase認証メソッド使用チェック
    const supabaseAuthMethods = [
      'auth.signUp', 'auth.signInWithPassword', 'auth.signOut',
      'auth.getUser', 'auth.resetPasswordForEmail', 'auth.updateUser'
    ];
    
    console.log('\n🔑 Supabase認証メソッド使用:');
    supabaseAuthMethods.forEach(method => {
      const used = content.includes(method);
      console.log(`  ${used ? '✅' : '❌'} ${method}: ${used ? '使用中' : '未使用'}`);
    });
    
    // セキュリティチェック
    const securityChecks = {
      hasPasswordValidation: content.includes('password') && (content.includes('length') || content.includes('validate')),
      hasEmailValidation: content.includes('email') && content.includes('@'),
      hasInputSanitization: content.includes('trim') || content.includes('sanitize'),
      exposesSecrets: content.includes('password') && content.includes('console.log')
    };
    
    console.log('\n🔒 セキュリティ分析:');
    Object.entries(securityChecks).forEach(([key, value]) => {
      const label = {
        hasPasswordValidation: 'パスワード検証',
        hasEmailValidation: 'メール検証',
        hasInputSanitization: '入力サニタイズ',
        exposesSecrets: '秘密情報漏洩リスク'
      }[key];
      
      const isGood = key === 'exposesSecrets' ? !value : value;
      console.log(`  ${isGood ? '✅' : '⚠️'} ${label}: ${value ? '有り' : '無し'}`);
    });
    
    return {
      totalFunctions: functions.length,
      functions: functions,
      criticalFunctions: criticalFunctions.map(func => ({
        name: func,
        implemented: foundFunctions.some(f => f.includes(func.toLowerCase()))
      })),
      errorHandling,
      securityChecks,
      supabaseIntegration: supabaseAuthMethods.filter(method => content.includes(method))
    };
    
  } catch (error) {
    console.log(`❌ 認証関数分析エラー: ${error.message}`);
    return { error: error.message };
  }
}

// 認証ページテスト
async function testAuthPages() {
  console.log('\n📄 認証ページ分析:');
  
  const authPages = [
    './src/app/auth/login/page.tsx',
    './src/app/auth/signup/page.tsx', 
    './src/app/auth/reset-password/page.tsx',
    './src/app/auth/verify-email/page.tsx',
    './src/app/auth/callback/page.tsx'
  ];
  
  const results = {};
  
  for (const pagePath of authPages) {
    try {
      const pageName = pagePath.split('/').slice(-2, -1)[0];
      
      if (!fs.existsSync(pagePath)) {
        results[pageName] = { exists: false };
        console.log(`❌ ${pageName}: ファイルが存在しません`);
        continue;
      }
      
      const content = fs.readFileSync(pagePath, 'utf8');
      
      // 分析項目
      const analysis = {
        exists: true,
        isReactComponent: content.includes('export default') && (content.includes('function') || content.includes('const')),
        hasForm: content.includes('<form') || content.includes('onSubmit'),
        hasInputValidation: content.includes('required') || content.includes('validation') || content.includes('error'),
        hasSubmitHandler: content.includes('onSubmit') || content.includes('handleSubmit'),
        usesAuthFunction: content.includes('signIn') || content.includes('signUp') || content.includes('resetPassword'),
        hasErrorDisplay: content.includes('error') && (content.includes('message') || content.includes('alert')),
        hasRedirect: content.includes('router') || content.includes('redirect') || content.includes('push'),
        hasLoading: content.includes('loading') || content.includes('pending') || content.includes('submitting')
      };
      
      results[pageName] = analysis;
      
      console.log(`✅ ${pageName}:`);
      console.log(`   React Component: ${analysis.isReactComponent ? '✅' : '❌'}`);
      console.log(`   フォーム: ${analysis.hasForm ? '✅' : '❌'}`);
      console.log(`   バリデーション: ${analysis.hasInputValidation ? '✅' : '❌'}`);
      console.log(`   送信処理: ${analysis.hasSubmitHandler ? '✅' : '❌'}`);
      console.log(`   認証関数使用: ${analysis.usesAuthFunction ? '✅' : '❌'}`);
      console.log(`   エラー表示: ${analysis.hasErrorDisplay ? '✅' : '❌'}`);
      console.log(`   リダイレクト: ${analysis.hasRedirect ? '✅' : '❌'}`);
      console.log(`   ローディング: ${analysis.hasLoading ? '✅' : '❌'}`);
      
    } catch (error) {
      results[pageName] = { exists: false, error: error.message };
      console.log(`❌ ${pageName}: ${error.message}`);
    }
  }
  
  return results;
}

// 認証フロー整合性チェック
async function testAuthFlow() {
  console.log('\n🔄 認証フロー整合性チェック:');
  
  try {
    // Layout や middleware をチェック
    const middlewareFile = './middleware.ts';
    const layoutFile = './src/app/layout.tsx';
    
    const checks = {
      hasMiddleware: fs.existsSync(middlewareFile),
      hasAuthProvider: false,
      hasProtectedRoutes: false,
      hasPublicRoutes: false
    };
    
    // Layout分析
    if (fs.existsSync(layoutFile)) {
      const layoutContent = fs.readFileSync(layoutFile, 'utf8');
      checks.hasAuthProvider = layoutContent.includes('AuthProvider') || layoutContent.includes('UserProvider');
    }
    
    // Middleware分析
    if (checks.hasMiddleware) {
      const middlewareContent = fs.readFileSync(middlewareFile, 'utf8');
      checks.hasProtectedRoutes = middlewareContent.includes('protected') || middlewareContent.includes('auth');
      checks.hasPublicRoutes = middlewareContent.includes('public') || middlewareContent.includes('/auth');
    }
    
    console.log(`  ${checks.hasMiddleware ? '✅' : '❌'} Middleware: ${checks.hasMiddleware ? '存在' : '不在'}`);
    console.log(`  ${checks.hasAuthProvider ? '✅' : '❌'} Auth Provider: ${checks.hasAuthProvider ? '有り' : '無し'}`);
    console.log(`  ${checks.hasProtectedRoutes ? '✅' : '❌'} 保護ルート: ${checks.hasProtectedRoutes ? '有り' : '無し'}`);
    console.log(`  ${checks.hasPublicRoutes ? '✅' : '❌'} 公開ルート: ${checks.hasPublicRoutes ? '有り' : '無し'}`);
    
    return checks;
    
  } catch (error) {
    console.log(`❌ 認証フロー分析エラー: ${error.message}`);
    return { error: error.message };
  }
}

// メイン実行
async function runAuthTests() {
  const functionResults = await testAuthFunctions();
  const pageResults = await testAuthPages();
  const flowResults = await testAuthFlow();
  
  console.log('\n' + '='.repeat(60));
  console.log('🔐 認証機能テスト結果');
  console.log('='.repeat(60));
  
  // 関数テスト結果
  if (!functionResults.error) {
    console.log(`\n⚡ 認証関数: ${functionResults.totalFunctions}個実装`);
    
    const implementedCritical = functionResults.criticalFunctions.filter(f => f.implemented);
    const missingCritical = functionResults.criticalFunctions.filter(f => !f.implemented);
    
    console.log(`   重要関数: ${implementedCritical.length}/${functionResults.criticalFunctions.length}個実装`);
    
    if (missingCritical.length > 0) {
      console.log(`   未実装: ${missingCritical.map(f => f.name).join(', ')}`);
    }
    
    console.log(`   Supabase統合: ${functionResults.supabaseIntegration.length}個メソッド使用`);
  } else {
    console.log(`\n❌ 認証関数: ${functionResults.error}`);
  }
  
  // ページテスト結果
  const existingPages = Object.entries(pageResults).filter(([name, info]) => info.exists);
  const missingPages = Object.entries(pageResults).filter(([name, info]) => !info.exists);
  
  console.log(`\n📄 認証ページ: ${existingPages.length}個存在`);
  
  if (missingPages.length > 0) {
    console.log(`   不在ページ: ${missingPages.map(([name]) => name).join(', ')}`);
  }
  
  // 機能完成度
  const completenessScores = existingPages.map(([name, info]) => {
    const features = ['hasForm', 'hasInputValidation', 'hasSubmitHandler', 'usesAuthFunction', 'hasErrorDisplay'];
    const implemented = features.filter(feature => info[feature]).length;
    return { name, score: implemented / features.length };
  });
  
  console.log('\n📊 ページ完成度:');
  completenessScores.forEach(({ name, score }) => {
    console.log(`   ${name}: ${Math.round(score * 100)}%`);
  });
  
  // フロー整合性
  if (!flowResults.error) {
    const flowScore = Object.values(flowResults).filter(v => typeof v === 'boolean' && v).length;
    console.log(`\n🔄 認証フロー完成度: ${flowScore}/4 (${Math.round(flowScore / 4 * 100)}%)`);
  }
  
  // 総合評価
  const overallScore = (
    (functionResults.error ? 0 : 1) +
    (existingPages.length > 0 ? 1 : 0) +
    (flowResults.error ? 0 : 1) +
    (completenessScores.length > 0 && completenessScores.every(c => c.score > 0.6) ? 1 : 0)
  ) / 4;
  
  console.log(`\n🎯 認証システム総合評価: ${Math.round(overallScore * 100)}%`);
  console.log(`   ${overallScore >= 0.8 ? '✅ 良好' : overallScore >= 0.6 ? '⚠️ 改善推奨' : '❌ 要修正'}`);
  
  return {
    functions: functionResults,
    pages: pageResults,
    flow: flowResults,
    score: overallScore
  };
}

runAuthTests().catch(console.error);