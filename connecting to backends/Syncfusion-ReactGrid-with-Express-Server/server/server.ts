/**
 * Express Server for Hospital Patient Management System
 * Provides UrlAdaptor-compatible REST API for Syncfusion DataGrid
 */

import express, { Application } from 'express';
import cors from 'cors';
import patientRoutes from './src/routes/patients.routes';

const app: Application = express();
const PORT = 5000;

// Enable CORS for all origins (configure as needed for production)
app.use(cors({
  origin: '*',
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Mount patient routes
app.use('/api/patients', patientRoutes);

app.listen(PORT, () => {
  console.log(`Patients endpoint: http://localhost:${PORT}/api/patients`);
});

export default app;
