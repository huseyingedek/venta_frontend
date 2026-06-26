'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ fontFamily: 'monospace', padding: '2rem', background: '#fff' }}>
        <h2 style={{ color: 'red' }}>Hata</h2>
        <pre style={{ background: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>
          {error?.message || 'Bilinmeyen hata'}
          {'\n'}
          {error?.stack || ''}
        </pre>
        <p>Digest: {error?.digest}</p>
        <button onClick={reset}>Yeniden Dene</button>
      </body>
    </html>
  );
}
