'use client';

import { useState } from 'react';

export default function TestDownloadPage() {
  const [status, setStatus] = useState('');

  const testCanvasDownload = () => {
    setStatus('Creating canvas...');

    // Canvasを作成
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d')!;

    // 簡単な図形を描画
    ctx.fillStyle = '#e7674c';
    ctx.fillRect(0, 0, 500, 500);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Test Image', 150, 250);

    setStatus('Converting to blob...');

    // Blobに変換してダウンロード
    canvas.toBlob((blob) => {
      if (!blob) {
        setStatus('Failed to create blob');
        return;
      }

      setStatus(`Blob created: ${blob.size} bytes`);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'test-image.png';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatus('Download complete!');
      }, 100);
    }, 'image/png');
  };

  return (
    <div className="min-h-screen bg-[rgba(254,255,250,0.96)] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Canvas Download Test</h1>

        <button
          onClick={testCanvasDownload}
          className="px-6 py-3 bg-[color:var(--gt-primary)] text-white rounded-lg hover:bg-[color:var(--gt-primary-strong)]"
        >
          Test Download
        </button>

        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <p>Status: {status || 'Ready'}</p>
        </div>
      </div>
    </div>
  );
}
