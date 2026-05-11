import './polyfills';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import './i18n';
import App from './app/app';
import { ThemeIterationSwitcher } from './components/dev/theme-iteration-switcher';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <StrictMode>
    <App />
    <ThemeIterationSwitcher />
  </StrictMode>,
);
