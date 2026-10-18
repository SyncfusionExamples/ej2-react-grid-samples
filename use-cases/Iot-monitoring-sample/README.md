# Industrial IoT Monitoring Dashboard

## Repository Description

This repository demonstrates a real-time **Industrial IoT Monitoring Dashboard** built with **React**, **Syncfusion React Components**,
**Socket.IO**, and **Node.js/Express**. It showcases enterprise-style remote data binding, live device monitoring, anomaly detection, reporting, and server-side data processing.

## Overview

The sample demonstrates:

-   Syncfusion React Grid with Remote Custom Binding
-   Socket.IO live updates
-   Server-side paging, filtering, sorting, and searching
-   Real-time dashboard statistics
-   Live anomaly detection

## Features

### Dashboard

-   Real-time Summary Cards
-   Live Device Monitoring Grid
-   Remote Custom Binding
-   Server-side Paging
-   Server-side Filtering
-   Server-side Sorting
-   Server-side Searching
-   Cell Editing
-   Advanced Filter Panel
-   Column Chooser
-   Responsive Layout

### Real-Time Monitoring

-   Socket.IO Integration
-   Incremental Row Updates
-   Live Summary Updates
-   Automatic Grid Refresh
-   Multi-client Synchronization

### Alerts

-   Historical Alerts Grid
-   Temperature Threshold Detection
-   Battery Low Detection
-   Date Range Filtering
-   Alert Severity Management

### Reports

-   Device Summary Reports
-   Excel Export
-   PDF Export
-   Sensor Analytics

## Prerequisites

-   Node.js 18+
-   npm
-   React
-   TypeScript
-   Vite

## Installation

``` bash
cd iot-monitoring-sample

cd server
npm install

cd ../client
npm install
```

## Running the Sample

### Start Backend

``` bash
cd server
npm run dev
```

### Start Frontend

``` bash
cd client
npm run dev
```

## Architecture

``` text
Client (React + Syncfusion)
        │
        ▼
 Remote Custom Binding
        │
        ▼
 Node.js + Express
        │
        ▼
 Device Service
        │
        ▼
 In-Memory Data Store
        ▲
        │
 Socket.IO
        │
        ▼
 Connected Clients
```

## Project Structure


```
iot-monitoring-sample/
│
├── client/                          # React Frontend (Vite)
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SummaryCard.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ToastNotification.tsx
│   │   ├── pages/                   # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Alerts.tsx
│   │   │   └── Reports.tsx
│   │   ├── services/                # API and Socket.IO services
│   │   │   ├── socketService.ts
│   │   │   └── apiService.ts
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useSocket.ts
│   │   │   └── useGridData.ts
│   │   ├── context/                 # React Context for state
│   │   │   └── AppContext.tsx
│   │   ├── utils/                   # Utility functions
│   │   │   ├── dateUtils.ts
│   │   │   └── constants.ts
│   │   ├── App.tsx                  # Root component
│   │   └── main.tsx                 # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── server/                          # Node.js + Express Backend
│   ├── models/                      # Data models
│   │   └── Device.js
│   ├── services/                    # Business logic
│   │   ├── DeviceService.js
│   │   └── SocketService.js
│   ├── controllers/                 # Request handlers
│   │   └── DeviceController.js
│   ├── routes/                      # API routes
│   │   └── deviceRoutes.js
│   ├── socket/                      # Socket.IO handlers
│   ├── mock-data/                   # Mock data generator
│   │   └── mockDataGenerator.js
│   ├── index.js                     # Server entry point
│   └── package.json
│
└── README.md                        # This file
```

## Technology Stack

### Frontend

-   React 19
-   TypeScript
-   Vite
-   Tailwind CSS 3
-   Syncfusion React Components
-   Socket.IO Client

### Backend

-   Node.js
-   Express.js
-   Socket.IO

## Syncfusion Components

-   Grid
-   Charts
-   Toast
-   DateRangePicker
-   Dialog
-   Sidebar
-   Toolbar
-   Buttons
-   DropDownList

## Grid Features

-   Remote Custom Binding
-   Paging
-   Sorting
-   Filtering
-   Searching
-   Editing
-   Column Chooser
-   Excel Export
-   PDF Export

## API Overview

### Devices

-   GET /api/devices/grid
-   PUT /api/devices/:deviceId
-   GET /api/devices/summary

### Alerts

-   GET /api/alerts/grid

### Reports

-   GET /api/reports

## Sample Data

-   1000 Industrial IoT Devices
-   Temperature Sensors
-   Pressure Sensors
-   Humidity Sensors
-   Voltage Sensors
-   Flow Sensors
-   Vibration Sensors

Each device contains:

-   Device ID
-   Device Name
-   Location
-   Sensor Type
-   Reading Value
-   Threshold
-   Signal Strength
-   Battery Level
-   Status
-   Last Updated

## Performance Features

-   Remote Data Binding
-   Server-side Processing
-   Incremental Socket Updates
-   Responsive Layout

## Learning Objectives

This sample demonstrates:

-   Remote Custom Binding
-   Server-side data operations
-   Socket.IO integration
-   Real-time synchronization
-   Live IoT monitoring

## License

© 2026 Syncfusion. All rights reserved.
