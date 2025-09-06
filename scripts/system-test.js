const { spawn } = require('child_process');

async function waitForServer(url, timeoutMs = 120000, intervalMs = 1000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok || (res.status >= 200 && res.status < 500)) return true;
    } catch (_) {}
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error(`Server not ready within ${timeoutMs / 1000}s: ${url}`);
}

function runNode(scriptPath, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath], { cwd, stdio: 'inherit' });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${scriptPath} exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

async function main() {
  console.log('🚀 Starting Next.js dev server (port 3000)...');
  const dev = spawn('npm', ['run', 'dev'], {
    cwd: 'gymtopia-app',
    stdio: 'pipe',
    env: { ...process.env },
  });

  let serverLogs = '';
  const logHandler = (buf) => {
    const text = buf.toString();
    serverLogs += text;
    // Surface key readiness hints without flooding output
    if (/ready - started server/i.test(text) || /compiled successfully/i.test(text)) {
      process.stdout.write(text);
    }
  };
  dev.stdout.on('data', logHandler);
  dev.stderr.on('data', logHandler);

  const stopServer = async () => {
    if (!dev || dev.killed) return;
    console.log('\n🧹 Stopping dev server...');
    dev.kill('SIGTERM');
    await new Promise(r => setTimeout(r, 1500));
    if (!dev.killed) dev.kill('SIGKILL');
  };

  try {
    // Wait for server to be reachable
    await waitForServer('http://localhost:3000');
    console.log('✅ Dev server is up. Running system tests...\n');

    // Run fast route checks first
    try {
      await runNode('gymtopia-app/test_routes.js');
    } catch (e) {
      console.warn('⚠️ Route test failed:', e.message);
    }

    // Run headless Puppeteer-based tests
    await runNode('simple_test.js');
    await runNode('interaction_test.js');

    console.log('\n🎉 System tests finished.');
  } catch (err) {
    console.error('\n❌ System test runner failed:', err.message);
    if (serverLogs) {
      console.error('\n--- Recent server logs (tail) ---');
      const tail = serverLogs.split('\n').slice(-40).join('\n');
      console.error(tail);
    }
    process.exitCode = 1;
  } finally {
    await stopServer();
  }
}

main();
