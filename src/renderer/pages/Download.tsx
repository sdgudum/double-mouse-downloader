import React from 'react';
import DownloadVideoItem from '../components/DownloadVideoItem';
import { useAppSelector } from '../redux/hooks';

const DownloadPage: React.FC = () => {
  const state = useAppSelector((state) => state.download);

  return (
    <main
      style={{
        margin: '0 2em',
        height: '90%',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      <section aria-label="下载控制"></section>
      {state.index.length === 0 && (
        <p style={{ color: 'white' }}>啥也木有...</p>
      )}
      <ul
        aria-label="下载列表"
        style={{
          listStyle: 'none',
          margin: '0',
          padding: '0',
        }}
      >
        {state.index.map((taskId) => {
          const task = state.taskMap[taskId];

          if (task.type === 'video')
            return <DownloadVideoItem key={taskId} task={task} />;

          return null;
        })}
      </ul>
    </main>
  );
};

export default DownloadPage;
