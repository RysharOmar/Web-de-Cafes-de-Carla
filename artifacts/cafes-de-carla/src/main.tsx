import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'next-themes';
import { LanguageProvider } from '@/context/LanguageContext';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';

import './index.css';

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </ErrorBoundary>,
);
