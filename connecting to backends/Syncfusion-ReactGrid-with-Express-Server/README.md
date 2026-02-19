# Syncfusion React Grid with Express.js Server

A lightweight, production-ready pattern for binding **Express.js** server data to a **Syncfusion React Grid**. The sample supports complete CRUD (Create, Read, Update, Delete), server-side filtering, searching, sorting, and paging using Syncfusion **DataManager**.

## Key Features

- **Express.js Server ↔ SQL Server**: Robust TypeScript backend with type-safe database operations
- **Syncfusion React Grid**: Built-in search, filter, sort, and paging capabilities
- **Complete CRUD Operations**: Add, edit, delete, and update records directly from the grid

## Prerequisites

  - Node.js: LTS version (v20.x or later)

  - npm/yarn: For package management.

  - React: For creating and serving the React client application
  
## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd syncfusion-react-grid-with-expressjs-server
   ```

2. **Run the application**

**Run the Express.js server**

```bash
   cd server
   npm install
   npm start
```

**Run the React client**

```bash
  cd client
  npm install
  npm run dev
```

3. **Open the application**

   The server runs at http://localhost:3000
   Navigate to the React application in your browser (typically `http://localhost:5173`).

## Configuration

**Security Note**: For production environments, store sensitive credentials using:

- Environment variables

- Secure storage solutions (e.g., Azure Key Vault, AWS Secrets Manager)

## Project Layout

| File/Folder | Purpose |
|-------------|---------|
| `server/src/routes/patients.routes.ts` | Server-side route handling grid data operations |
| `server/src/controllers/patients.controller.ts` | Controller logic for CRUD operations |
| `server/src/utils/data.ts` | Entity model containing the data |
| `server/src/types/interface.ts` | TypeScript interfaces and types |
| `client/src/components/PatientsGrid.tsx` | Contains the Grid configuration and component |

## Common Tasks

### Add a Record
1. Click the **Add** button in the toolbar
2. Fill in the form fields
3. Click **Update** button in the toolbar to save the record.

### Edit a Record
1. Select a row in the grid
2. Click the **Edit** button in the toolbar
3. Modify the required fields
4. Click **Update** to save changes

### Delete a Record
1. Select a row in the grid
2. Click the **Delete** button in the toolbar
3. Confirm the deletion

### Search Records
1. Use the **Search** box in the toolbar
2. Enter keywords to filter records (searches across all columns)

### Filter Records
1. Click the filter icon in any column header
2. Select filter criteria (equals, contains, greater than, etc.)
3. Click **Filter** to apply

### Sort Records
1. Click the column header to sort ascending
2. Click again to sort descending

## Reference
For detailed information, refer to the [Syncfusion React Grid documentation](https://ej2.syncfusion.com/react/documentation/grid/getting-started).