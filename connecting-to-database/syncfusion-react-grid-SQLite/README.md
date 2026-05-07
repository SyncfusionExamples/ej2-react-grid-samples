# React Grid with SQLite and Entity Framework Core

## Project Overview

This repository demonstrates a production-ready pattern for binding **SQLite** data to **Syncfusion React Grid** using **Entity Framework Core (EF Core)**. SQLite is a lightweight, serverless, embedded database that is ideal for mobile applications, desktop applications, and small-to-medium scale web applications. The sample application provides complete CRUD (Create, Read, Update, Delete) operations, filtering, sorting, paging, and batch updates with a clean separation between the React frontend and ASP.NET Core backend.

## Key Features

- **SQLite–Entity Framework Core Integration**: Lightweight, serverless database with automatic SQL generation and migrations
- **Syncfusion React Grid**: Built-in search, filter, sort, paging, and toolbar capabilities
- **Complete CRUD Operations**: Add, edit, delete, and batch update asset records directly from the grid
- **Type Safety**: Strongly-typed LINQ queries with Entity Framework Core
- **CustomAdaptor**: Full control over grid data operations (read, search, filter, sort, page)
- **Database Transactions**: Batch operations are executed within database transactions for data consistency
- **ASP.NET Core Web API**: RESTful backend service with proper CORS configuration
- **Embedded Database**: SQLite database file stored on disk with configurable path

## Prerequisites

| Component | Version | Purpose |
|-----------|---------|---------|
| Visual Studio 2022 | 17.0 or later | Development IDE with ASP.NET Core and React workload |
| .NET SDK | 9.0 or later | Runtime and build tools for backend API |
| Node.js | 18.x or later | JavaScript runtime for React development |
| npm | 11.x or later | Package manager |
| SQLite | 3.0 or later | Embedded database engine |
| Microsoft.EntityFrameworkCore | 9.0.0 or later | Core framework for database operations |
| Microsoft.EntityFrameworkCore.Sqlite | 9.0.0 or later | SQLite provider for Entity Framework Core |
| Microsoft.EntityFrameworkCore.Tools | 9.0.0 or later | Tools for managing database migrations |
| Syncfusion.EJ2.AspNet.Core | Latest | Server helpers (DataManagerRequest, QueryableOperation) |
| @syncfusion/ej2-react-grids | Latest | React Grid component |
| @syncfusion/ej2-data | Latest | Data management utilities |

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd syncfusion-react-grid-SQLite
   ```

2. **Create the database and table**

   Open your file explorer or use **DB Browser for SQLite** or the `sqlite3` command-line tool to create an `asset.db` file, then run the following SQL script:

   ```sql
   -- Create the IT Assets table
   CREATE TABLE IF NOT EXISTS asset (
       Id              INTEGER PRIMARY KEY AUTOINCREMENT,
       AssetID         TEXT NOT NULL UNIQUE,
       AssetName       TEXT NOT NULL,
       AssetType       TEXT NOT NULL,
       Model           TEXT,
       SerialNumber    TEXT NOT NULL,
       InvoiceID       TEXT,
       AssignedTo      TEXT,
       Department      TEXT,
       PurchaseDate    DATE,
       PurchaseCost    REAL,
       WarrantyExpiry  DATE,
       Condition       TEXT CHECK(Condition IN ('New', 'Good', 'Fair', 'Poor')) DEFAULT 'New',
       LastMaintenance DATE,
       Status          TEXT CHECK(Status IN ('Active', 'In Repair', 'Retired', 'Available')) DEFAULT 'Available'
   );

   -- Insert Sample Data (Optional)
   INSERT INTO asset (AssetID, AssetName, AssetType, Model, SerialNumber, InvoiceID, AssignedTo, Department, PurchaseDate, PurchaseCost, WarrantyExpiry, Condition, LastMaintenance, Status)
   VALUES
       ('AST-001', 'Dell Latitude Laptop', 'Laptop', 'Latitude 5520', 'SN-DEL-2024-001', 'INV-2023-0015', 'John Smith', 'IT', '2023-01-15', 1250.00, '2026-01-15', 'Good', '2024-06-10', 'Active'),
       ('AST-002', 'HP ProBook Laptop', 'Laptop', 'ProBook 450 G8', 'SN-HP-2024-002', 'INV-2023-0042', 'Sarah Johnson', 'Finance', '2023-03-20', 1100.00, '2026-03-20', 'Good', '2024-05-15', 'Active');
   ```

3. **Update the connection string**

   Open `Grid_SQLite.Server/appsettings.json` and configure the SQLite database path:

   ```json
   {
     "Logging": {
       "LogLevel": {
         "Default": "Information",
         "Microsoft.AspNetCore": "Warning"
       }
     },
     "AllowedHosts": "*",
     "ConnectionStrings": {
       "DefaultConnection": "Data Source=D:\\Database\\asset.db"
     }
   }
   ```

   **Note**: Update the path to match where you created the `asset.db` file on your system.

4. **Install server dependencies and run the API**

   ```bash
   cd Grid_SQLite.Server
   dotnet build
   dotnet run
   ```

   The API will run at `https://localhost:7116` (or the port shown in terminal).

5. **Install client dependencies and run the React app**

   Open a new terminal:

   ```bash
   cd grid_sqlite.client
   npm install
   npm run dev
   ```

6. **Open the application**

   Navigate to the local URL displayed in the terminal (typically `http://localhost:5173`).

## Configuration

### Database Path

The connection string in **appsettings.json** points to the SQLite database file:

```json
"DefaultConnection": "Data Source=D:\\Database\\asset.db"
```

| Component | Description | Example |
|-----------|-------------|---------|
| Data Source | Path to the SQLite database file | `C:\Users\YourName\Documents\asset.db` or `/home/user/databases/asset.db` |

**Notes**:
- SQLite stores the entire database in a single file
- The file path can be absolute (full path) or relative (relative to the application)
- The directory must exist; SQLite will create the file if it doesn't exist
- For production, use a centralized database location accessible to the application

### API Base URL

The React client connects to the API server. Update the URLs in (**grid_sqlite.client/src/App.tsx**) if your API runs on a different port:

```typescript
const dataManager = useMemo(
  () =>
    new DataManager({
      url: `https://localhost:7116/api/asset/url`,
      insertUrl: `https://localhost:7116/api/asset/insert`,
      updateUrl: `https://localhost:7116/api/asset/update`,
      removeUrl: `https://localhost:7116/api/asset/remove`,
      batchUrl: `https://localhost:7116/api/asset/batch`,
      adaptor: new CustomAdaptor(),
    }),
  [],
);
```

## Project Layout

| File/Folder | Purpose |
|-------------|---------|
| **Backend (Grid_SQLite.Server)** | |
| `/Data/Asset.cs` | Entity model representing the asset table with data annotations |
| `/Data/AssetDbContext.cs` | Entity Framework Core DbContext for SQLite database operations |
| `/Controllers/AssetController.cs` | ASP.NET Core Web API controller with CRUD and batch endpoints |
| `/Program.cs` | Service registration, EF Core configuration, and CORS setup |
| `/appsettings.json` | Application configuration including SQLite connection string |
| **Frontend (grid_sqlite.client)** | |
| `/src/App.tsx` | Main React component with Grid configuration and column templates |
| `/src/CustomAdaptor.ts` | Custom data adaptor extending UrlAdaptor for handling grid operations |
| `/src/index.css` | Global CSS styles including Syncfusion theme imports |
| `/src/main.tsx` | React application entry point |
| `/package.json` | NPM dependencies and scripts |
| `/vite.config.ts` | Vite build configuration |

## Common Tasks

### Add an Asset
1. Click the **Add** button in the grid toolbar
2. Fill in the form fields (Asset Name, Asset Type, Serial Number, Department, etc.)
3. Click **Update** to persist the record to the SQLite database
4. The asset is immediately saved with an auto-generated `Id` and appears in the grid

### Edit an Asset
1. Select a row in the grid
2. Click the **Edit** button in the toolbar (or double-click the row)
3. Modify the required fields using the appropriate editors (date pickers, dropdowns, etc.)
4. Click **Update** to save changes to the database

### Delete an Asset
1. Select a row in the grid
2. Click the **Delete** button in the toolbar
3. Confirm the deletion
4. The record is removed from the SQLite database and the grid

### Search Records
1. Use the **Search** box in the toolbar
2. Enter keywords to filter records across all configured columns

### Filter Records
1. Click the filter icon in any column header
2. Select filter criteria (equals, contains, date range, etc.)
3. Click **Filter** to apply

### Sort Records
1. Click the column header to sort ascending
2. Click again to sort descending
3. Hold **Shift** and click another column for multi-column sorting

## Architecture Overview

### Backend Flow

1. **Client Request**: React Grid (via CustomAdaptor) sends HTTP POST requests to `/api/asset/*` endpoints
2. **Controller**: `AssetController` receives the request with `DataManagerRequest` parameters
3. **QueryableOperation**: Syncfusion's helper class applies searching, filtering, sorting, and paging to IQueryable
4. **DbContext**: `AssetDbContext` uses Entity Framework Core to execute LINQ queries against SQLite
5. **Database**: SQLite processes the query and returns results
6. **Response**: Data flows back through DbContext → controller → HTTP response → CustomAdaptor → Grid

### CustomAdaptor

The `CustomAdaptor` extends Syncfusion's `UrlAdaptor` and handles:
- **Read operations**: POST requests with `DataManagerRequest` payload for filtering, sorting, paging
- **CRUD operations**: POST requests wrapping records with proper key handling
- **Batch operations**: POST request with `{ added, changed, deleted }` arrays executed as a database transaction
- **Response transformation**: Processes server responses into Grid-compatible format

### Entity Framework Core with SQLite

EF Core features used in the sample:

| Feature | Description |
|---------|-------------|
| `DbSet<T>` | Represents a table in the SQLite database |
| `OnModelCreating()` | Configures table mappings, column constraints, default values |
| `UseSqlite()` | Registers SQLite as the database provider |
| `SaveChangesAsync()` | Persists changes to the SQLite database |
| `FindAsync()` | Retrieves an entity by primary key |
| `ToListAsync()` | Executes the query and returns results |
| `BeginTransactionAsync()` | Starts a database transaction for batch operations |

### API Endpoints

| Operation | HTTP Method | Endpoint | Purpose |
|-----------|-------------|----------|---------|
| Read/Filter/Sort/Page | POST | `/api/asset/url` | Retrieves data with applied filters, sorting, and paging |
| Insert | POST | `/api/asset/insert` | Adds a new asset record |
| Update | POST | `/api/asset/update` | Updates an existing asset record |
| Delete | POST | `/api/asset/remove` | Deletes an asset record by ID |
| Batch | POST | `/api/asset/batch` | Handles multiple add, update, and delete operations in a single transaction |

## Troubleshooting

### Connection Error
- Verify the path in `DefaultConnection` points to a valid `asset.db` file
- Ensure the directory path exists and is accessible
- Check that the application has read/write permissions for the database file
- SQLite creates the file automatically if it doesn't exist (with proper permissions)

### Missing Tables
- Verify the SQL script was executed successfully using DB Browser for SQLite or another SQLite client
- Check that the `asset` table exists in the `asset.db` file
- Run the database creation script again if needed
- Confirm column names and types match the `Asset` model

### CORS Issues
- Verify CORS is configured in `Program.cs` with `app.UseCors("cors")`
- Check that the policy allows any origin with `AllowAnyOrigin()`
- Clear browser cache and restart both server and client
- Ensure `app.UseCors("cors")` is called before `app.MapControllers()`

### Grid Not Loading Data
- Check the browser console for errors
- Verify the API is running at the configured URL
- Test the API endpoint directly using Postman (POST to `/api/asset/url` with body `{}`)
- Ensure the `CustomAdaptor` is correctly configured in `App.tsx`
- Check that Entity Framework Core is properly configured with SQLite in `Program.cs`

### Entity Framework Mapping Issues
- Ensure the `Asset` model property names match the database column names
- Check that the DbContext is correctly configured with `OnModelCreating()`
- Verify nullable properties are marked with `?` in the model
- Use `[MaxLength]` attributes for string properties to match database column lengths

### Database File Lock Issues
- Close any open SQLite clients or DB browsers that may lock the file
- Ensure the application has exclusive access to the database file
- Restart the ASP.NET Core server if the database file is locked
- In development, consider using an in-memory SQLite database for testing

## Reference
The [user guide](https://ej2.syncfusion.com/react/documentation/grid/connecting-to-database/sqlite-server) provides detailed directions in a clear, step-by-step format.

# Steps to download GitHub samples using DownGit

1. **Open the DownGit Website**

    Go to the official DownGit tool: https://downgit.github.io/#/home

2. **Copy the GitHub URL**

    - Navigate to the sample folder you want to download and copy its URL.
    - Example : https://github.com/SyncfusionExamples/ej2-react-grid-samples/tree/master/connecting-to-database/syncfusion-react-grid-SQLite

3. **Paste the URL into DownGit**  

    In the DownGit input box, paste the copied GitHub URL.

4. **Download the ZIP**

    - Click **Download**.
    - DownGit will generate a ZIP file of the selected folder, which you can save and extract locally.