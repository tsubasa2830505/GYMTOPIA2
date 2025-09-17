const { spawn } = require('child_process');
const path = require('path');

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForServer(url, timeoutMs = 120000, intervalMs = 1000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok || (res.status >= 200 && res.status < 500)) return true;
    } catch (_) {}
    await wait(intervalMs);
  }
  throw new Error(`Server not ready within ${timeoutMs / 1000}s: ${url}`);
}

function runNode(scriptPath, cwd = process.cwd(), env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath], {
      cwd,
      stdio: 'inherit',
      env: { ...process.env, ...env, NODE_PATH: path.join(cwd, 'gymtopia-app', 'node_modules') }
    });
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${path.basename(scriptPath)} exited with ${code}`)));
    child.on('error', reject);
  });
}

async function main() {
  console.log('🎬 Scenario test runner starting Next.js dev server...');

  const repoRoot = path.resolve(__dirname, '..');
  const appDir = path.join(repoRoot, 'gymtopia-app');

  const dev = spawn('npm', ['run', 'dev'], {
    cwd: appDir,
    stdio: 'pipe',
    env: { ...process.env, NEXT_PUBLIC_DATA_MODE: 'mock', PORT: '3000' }
  });
  const logHandler = (buf) => {
    const t = buf.toString();
    if (/ready - started server|compiled successfully|Local:/i.test(t)) process.stdout.write(t);
  };
  dev.stdout.on('data', logHandler);
  dev.stderr.on('data', logHandler);

  const stop = async () => {
    if (!dev || dev.killed) return;
    console.log('\n🧹 Stopping dev server...');
    dev.kill('SIGTERM');
    await wait(1200);
    if (!dev.killed) dev.kill('SIGKILL');
  };

  try {
    await waitForServer('http://localhost:3000');
    console.log('✅ Dev server ready. Running scenario flow...');
    await runNode(path.join(repoRoot, 'scenario_test.js'), repoRoot, { NEXT_PUBLIC_DATA_MODE: 'mock' });
    console.log('\n🎉 Scenario tests completed');
  } catch (e) {
    console.error('❌ Scenario runner failed:', e.message);
    process.exitCode = 1;
  } finally {
    await stop();
  }
}

main();
