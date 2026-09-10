import React, { useEffect } from 'react'
import InventoryDataGrid from './components/InventoryDataGrid'
import './App.css'

function App(): React.ReactElement {
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const response = await fetch('http://localhost:5000/health')
        if (cancelled) return
        if (!response.ok) {
          console.warn('API server is not responding')
        }
      } catch {
        console.warn('Cannot reach API server at http://localhost:5000. Start it with: cd server && python app.py')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="app">
      <InventoryDataGrid />
    </div>
  )
}

export default App
