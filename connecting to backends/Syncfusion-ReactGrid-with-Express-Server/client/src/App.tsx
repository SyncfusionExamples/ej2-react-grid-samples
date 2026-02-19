/**
 * Main App Component
 * Hospital Patient Management System with Syncfusion DataGrid
 */

import React from 'react';
import PatientsGrid from './components/PatientsGrid';
import './App.css';

/**
 * Main Application Component
 */
const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🏥 Hospital Patient Management System</h1>
          <p className="header-subtitle">
            Powered by Syncfusion EJ2 React DataGrid with UrlAdaptor
          </p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <PatientsGrid />
        </div>
      </main>

      <footer className="app-footer">
        <p>
          © 2026 Hospital Patient Management System | Built with React + Express.js + Syncfusion EJ2
        </p>
      </footer>
    </div>
  );
};

export default App;
