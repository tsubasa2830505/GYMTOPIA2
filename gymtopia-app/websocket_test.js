const WebSocket = require('ws');

// Supabase Realtime WebSocket URL
const wsUrl = 'wss://htytewqvkgwyuvcsvjwm.supabase.co/realtime/v1/websocket?apikey=' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('WebSocket接続テスト開始...');

const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('✅ WebSocket接続成功');
  
  // ハートビート送信
  setInterval(() => {
    ws.send(JSON.stringify({ type: 'heartbeat' }));
  }, 30000);
  
  // テスト完了後に切断
  setTimeout(() => {
    ws.close();
    console.log('テスト完了 - 接続を閉じました');
    process.exit(0);
  }, 5000);
});

ws.on('message', (data) => {
  console.log('📨 メッセージ受信:', data.toString().substring(0, 100));
});

ws.on('error', (error) => {
  console.error('❌ WebSocketエラー:', error.message);
});

ws.on('close', () => {
  console.log('WebSocket接続が閉じられました');
});
