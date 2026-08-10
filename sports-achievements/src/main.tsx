import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './group/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
