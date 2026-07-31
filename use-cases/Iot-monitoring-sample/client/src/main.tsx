import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register Syncfusion license key here if you have one:
// import { registerLicense } from '@syncfusion/ej2-base'
// registerLicense('YOUR_LICENSE_KEY')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
