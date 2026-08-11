import { createRoot } from 'react-dom/client';
import './index.css';
import StockGrid from './components/StockGrid.tsx';

createRoot(document.getElementById('root')!).render(
  <StockGrid />
)
