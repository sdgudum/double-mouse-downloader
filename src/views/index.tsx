import React, { FC, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ipcRenderer } from 'electron';

const App: FC = () => {
  return <div>{import.meta.env.MODE}</div>;
};

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(<App />);
