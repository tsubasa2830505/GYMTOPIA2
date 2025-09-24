#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// alt属性の自動生成ルール
const altTextRules = {
  'avatar': 'ユーザーアバター',
  'profile': 'プロフィール画像',
  'gym': 'ジム画像',
  'logo': 'ロゴ',
  'icon': 'アイコン',
  'banner': 'バナー画像',
  'thumbnail': 'サムネイル画像',
  'gymtopia': 'ジムトピアロゴ',
  'user': 'ユーザー画像',
  'equipment': '器具画像',
  'machine': 'マシン画像'
};

// ファイルパスからalt textを推測
function guessAltText(imageSrc, context) {
  const srcLower = (imageSrc || '').toLowerCase();
  const contextLower = (context || '').toLowerCase();

  // ルールに基づいてalt textを決定
  for (const [key, value] of Object.entries(altTextRules)) {
    if (srcLower.includes(key) || contextLower.includes(key)) {
      return value;
    }
  }

  // デフォルト
  return '画像';
}

// Imageコンポーネントにalt属性を追加
function fixImageComponent(content, fileName) {
  let modified = content;
  let changeCount = 0;

  // Next.js Imageコンポーネントのパターン
  const imageRegex = /<Image\s+([^>]*?)(?:\/>|>[\s\S]*?<\/Image>)/g;

  modified = modified.replace(imageRegex, (match, attributes) => {
    // 既にalt属性がある場合はスキップ
    if (/alt\s*=/.test(attributes)) {
      return match;
    }

    // src属性を探す
    const srcMatch = attributes.match(/src\s*=\s*["']([^"']+)["']/);
    const src = srcMatch ? srcMatch[1] : '';

    // 適切なalt textを生成
    const altText = guessAltText(src, fileName);

    // alt属性を追加
    changeCount++;
    return match.replace('<Image', `<Image alt="${altText}"`);
  });

  // HTMLのimgタグのパターン
  const imgRegex = /<img\s+([^>]*?)(?:\/>|>)/g;

  modified = modified.replace(imgRegex, (match, attributes) => {
    // 既にalt属性がある場合はスキップ
    if (/alt\s*=/.test(attributes)) {
      return match;
    }

    // src属性を探す
    const srcMatch = attributes.match(/src\s*=\s*["']([^"']+)["']/);
    const src = srcMatch ? srcMatch[1] : '';

    // 適切なalt textを生成
    const altText = guessAltText(src, fileName);

    // alt属性を追加
    changeCount++;
    return match.replace('<img', `<img alt="${altText}"`);
  });

  return { content: modified, changeCount };
}

// ディレクトリを再帰的に処理
function processDirectory(dir) {
  let totalChanges = 0;
  let filesProcessed = 0;

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // node_modulesと.nextは除外
      if (file !== 'node_modules' && file !== '.next') {
        const result = processDirectory(filePath);
        totalChanges += result.totalChanges;
        filesProcessed += result.filesProcessed;
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const { content: modified, changeCount } = fixImageComponent(content, file);

      if (changeCount > 0) {
        fs.writeFileSync(filePath, modified, 'utf8');
        console.log(`✅ ${filePath}: ${changeCount} 箇所修正`);
        totalChanges += changeCount;
      }
      filesProcessed++;
    }
  });

  return { totalChanges, filesProcessed };
}

// メイン処理
console.log('🔧 Alt属性の自動修正を開始します...\n');

const srcPath = path.join(__dirname, '../src');
const { totalChanges, filesProcessed } = processDirectory(srcPath);

console.log('\n=================================');
console.log(`✨ 完了!`);
console.log(`📊 処理ファイル数: ${filesProcessed}`);
console.log(`🔧 修正箇所: ${totalChanges}`);
console.log('=================================');