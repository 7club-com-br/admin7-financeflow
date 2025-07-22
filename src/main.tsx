import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LicenseProvider } from './contexts/LicenseContext'

createRoot(document.getElementById("root")!).render(
  <LicenseProvider>
    <App />
  </LicenseProvider>
);
