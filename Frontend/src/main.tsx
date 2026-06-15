import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './data/providers/AuthProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
      <AuthProvider>
          <App />
      </AuthProvider>
  </BrowserRouter>,
)
