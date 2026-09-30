import React from 'react';
import { createRoot } from 'react-dom/client';
import './views/design.generated.css';
import { Shell } from './logic/Shell.logic';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Shell />
  </React.StrictMode>,
);
