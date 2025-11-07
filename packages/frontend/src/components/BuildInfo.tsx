import type { FC } from 'react';

const BuildInfo: FC = () => {
  const commit = (import.meta.env.VITE_COMMIT as string) || 'dev';

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
      Commit: {commit}
    </div>
  );
};

export default BuildInfo;
