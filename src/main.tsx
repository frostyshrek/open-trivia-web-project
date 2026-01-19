import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'src/css/root/index.css'
import App from 'src/App.tsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
