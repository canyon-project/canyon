import type { FC } from 'react';
import { useEffect, useState } from 'react';

const BuildInfo: FC = () => {
  const commit = (import.meta.env.VITE_COMMIT as string) || 'dev';
  const [serverOS, setServerOS] = useState<string>('...');
  const [serverNode, setServerNode] = useState<string>('...');
  const [clientBrowser, setClientBrowser] = useState<string>('...');

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('/api/runtime', { credentials: 'include' });
        if (resp.ok) {
          const data = await resp.json();
          const osText =
            `${data?.server?.type || ''} ${data?.server?.release || ''} ${data?.server?.arch || ''}`.trim();
          setServerOS(osText || 'Unknown OS');
          setServerNode((data?.server?.node as string) || 'unknown');
          setClientBrowser(
            (data?.client?.browser as string) || 'Unknown Browser',
          );
        }
      } catch {
        setServerOS('Unknown OS');
        setServerNode('unknown');
        setClientBrowser('Unknown Browser');
      }
    })();
  }, []);

  return (
    <div
      title={`Commit: ${commit} (点击复制)`}
      style={{
        position: 'fixed',
        right: 12,
        bottom: 12,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.55)',
        color: '#fff',
        borderRadius: 8,
        padding: '6px 10px',
        fontSize: 12,
        cursor: 'pointer',
        userSelect: 'none',
        backdropFilter: 'saturate(120%) blur(2px)',
        fontFamily:
          'IBMPlexMono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      }}
    >
      <div>Commit: {commit}</div>
      <div>OS: {serverOS}</div>
      <div>Browser: {clientBrowser}</div>
      <div>Node: {serverNode}</div>
    </div>
  );
};

export default BuildInfo;
