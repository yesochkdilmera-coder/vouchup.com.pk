import { createRoot } from 'react-dom/client'
import { AuthProvider } from './components/AuthProvider.jsx'
import { ToastProvider } from './components/ToastContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </AuthProvider>
)
