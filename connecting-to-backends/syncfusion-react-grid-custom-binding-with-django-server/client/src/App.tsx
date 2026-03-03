import React from 'react';
import { registerLicense } from '@syncfusion/ej2-base';
import OrdersGrid from './components/OrdersGrid';
import './App.css';

const licenseKey = (import.meta as { env: Record<string, string | undefined> }).env
  .VITE_SYNCFUSION_LICENSE_KEY;

if (licenseKey) {
  registerLicense(licenseKey);
}

const App: React.FC = () => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Library Lending Records</h1>
        <p>Custom data binding with Syncfusion React Grid and Django REST Framework</p>
      </header>
      <OrdersGrid />
    </div>
  );
};

export default App;