# React Grid with SQL Server and ADO.NET SqlClient

## Project Overview

This repository demonstrates a production-ready pattern for binding **MSSQL Server** data to **Syncfusion React Grid** using **ADO.NET SqlClient**. The sample application provides complete CRUD (Create, Read, Update, Delete) operations, filtering, sorting, paging, and batch updates. The implementation follows industry best practices using ASP.NET Core Web API, repository pattern, and a custom adaptor for seamless grid-to-server communication.

## Key Features

- **MSSQL Server–SqlClient Integration**: Direct, high-performance ADO.NET access to SQL Server with full SQL control
- **Syncfusion React Grid**: Built-in search, filter, sort, paging, and toolbar capabilities
- **Complete CRUD Operations**: Add, edit, delete, and batch update ticket records directly from the grid
- **Repository Pattern**: Clean separation of concerns with dependency injection support
- **CustomAdaptor**: Full control over grid data operations (read, search, filter, sort, page)
- **ASP.NET Core Web API**: RESTful backend service with proper CORS configuration
- **Configurable Connection String**: Database credentials managed via **appsettings.json**

## Prerequisites

| Component | Version | Purpose |
|-----------|---------|---------|
| Visual Studio 2022 | 17.0 or later | Development IDE with React and ASP.NET Core workload |
| .NET SDK | 8.0 or later | Runtime and build tools for backend API |
| Node.js | 18.x or later | JavaScript runtime for React development |
| npm | 11.x or later | Package manager |
| SQL Server | 2019 or later | Database server |
| Microsoft.Data.SqlClient | Latest | Official SQL Server data provider for ADO.NET |
| Syncfusion.EJ2 | Latest | Server helpers (DataManagerRequest, DataOperations) |
| @syncfusion/ej2-react-grids | Latest | React Grid component |
| @syncfusion/ej2-data | Latest | Data management utilities |

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd syncfusion-react-grid-MSSQL
   ```

2. **Create the database and table**

   Open SQL Server Management Studio (SSMS) or any SQL Server client and run:
    ```sql
    -- Create Database
    IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'NetworkSupportDB')
    BEGIN
        CREATE DATABASE NetworkSupportDB;
    END
    GO

    USE NetworkSupportDB;
    GO

    -- Create Tickets Table
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Tickets')
    BEGIN
        CREATE TABLE dbo.Tickets (
            TicketId INT PRIMARY KEY IDENTITY(1,1),
            PublicTicketId VARCHAR(50) NOT NULL UNIQUE,
            Title VARCHAR(200) NULL,
            Description TEXT NULL,
            Category VARCHAR(100) NULL,
            Department VARCHAR(100) NULL,
            Assignee VARCHAR(100) NULL,
            CreatedBy VARCHAR(100) NULL,
            Status VARCHAR(50) NOT NULL DEFAULT 'Open',
            Priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
            ResponseDue DATETIME2 NULL,
            DueDate DATETIME2 NULL,
            CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
            UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
        );
    END
    GO

    -- Insert Sample Data (Optional)
    INSERT INTO dbo.Tickets (PublicTicketId, Title, Description, Category, Department, Assignee, CreatedBy, Status, Priority, ResponseDue, DueDate, CreatedAt, UpdatedAt)
    VALUES
    ('NET-1001', 'Network Connectivity Issue', 'Users unable to connect to the VPN', 'Network Issue', 'Network Ops', 'John Doe', 'Alice Smith', 'Open', 'High', '2026-01-14 10:00:00', '2026-01-15 17:00:00', '2026-01-13 10:15:30', '2026-01-13 10:15:30'),
    ('NET-1002', 'Server Performance Degradation', 'Email server responding slowly', 'Performance', 'Infrastructure', 'Emily White', 'Bob Johnson', 'InProgress', 'Critical', '2026-01-13 15:00:00', '2026-01-14 17:00:00', '2026-01-13 11:20:10', '2026-01-13 11:20:10');
    GO
    ```

3. **Update the connection string**

   Open **Grid_MSSQL.Server/appsettings.json** and configure the SQL Server connection:

    ```json
    {
    "ConnectionStrings": {
        "TicketDb": "Data Source=localhost;Initial Catalog=NetworkSupportDB;Integrated Security=True;Connect Timeout=30;Encrypt=False;Trust Server Certificate=False;Application Intent=ReadWrite;Multi Subnet Failover=False"
    },
    "Logging": {
        "LogLevel": {
        "Default": "Information",
        "Microsoft.AspNetCore": "Warning"
        }
    },
    "AllowedHosts": "*"
    }
    ```

4. **Install server dependencies and run the API**
   ```bash
   cd Grid_MSSQL.Server
   dotnet build
   dotnet run
   ```
   The API will run at `http://localhost:5239` (or the port shown in terminal).

5. **Install client dependencies and run the React app**

   Open a new terminal:
   ```bash
   cd grid_mssql.client
   npm install
   npm run dev
   ```

6. **Open the application**

   Navigate to the local URL displayed in the terminal (typically `http://localhost:5173`).

## Configuration

### Connection String

The connection string in **appsettings.json** contains the following components:

| Component | Description | Example |
|-----------|-------------|---------|
| Data Source | SQL Server instance name or IP address | `localhost` or `.\SQLEXPRESS` |
| Initial Catalog | Database name | `NetworkSupportDB` |
| Integrated Security | Windows Authentication | `True` (for local development) |
| Connect Timeout | Connection timeout in seconds | `30` |
| Encrypt | Enable encryption for the connection | `False` (for local development) |
| Trust Server Certificate | Trust the server certificate | `False` |
| Application Intent | Connection intent (ReadWrite or ReadOnly) | `ReadWrite` |
| Multi Subnet Failover | Used in failover clustering scenarios | `False` |

**Security Note**: For production environments, store sensitive credentials using:
- User secrets for development
- Environment variables for production
- Azure Key Vault or similar secure storage solutions

For SQL Server Authentication (username/password):
```
Data Source=your-server;Initial Catalog=NetworkSupportDB;User ID=sa;Password=<secure-password>;Encrypt=True;TrustServerCertificate=True
```

### API Base URL

The React client connects to the API server. Update the `BASE_URL` in **grid_mssql.client/src/App.tsx** if your API runs on a different port:

```typescript
const BASE_URL = 'http://localhost:5239/api/tickets';
```

## Project Layout

| File/Folder | Purpose |
|-------------|---------|
| **Backend (Grid_MSSQL.Server)** | |
| `/Data/Tickets.cs` | Entity model representing the Tickets table |
| `/Data/TicketRepository.cs` | Repository class providing async CRUD methods using ADO.NET SqlClient |
| `/Controllers/TicketsController.cs` | ASP.NET Core Web API controller with CRUD and batch endpoints |
| `/Program.cs` | Service registration, CORS configuration, and app setup |
| `/appsettings.json` | Application configuration including connection string |
| **Frontend (grid_mssql.client)** | |
| `/src/App.tsx` | Main React component with Grid configuration and column templates |
| `/src/CustomAdaptor.ts` | Custom data adaptor extending UrlAdaptor for handling grid operations |
| `/src/index.css` | Global CSS styles including Syncfusion theme imports |
| `/src/main.tsx` | React application entry point |
| `/package.json` | NPM dependencies and scripts |
| `/vite.config.ts` | Vite build configuration |

## Common Tasks

### Add a Ticket
1. Click the **Add** button in the grid toolbar
2. Fill in the form fields (Title, Status, Priority, Category, Department, Assignee, etc.)
3. Click **Update** to persist the record to the database
4. The system automatically generates a unique `PublicTicketId` (e.g., NET-1001)

### Edit a Ticket
1. Select a row in the grid
2. Click the **Edit** button in the toolbar (or double-click the row)
3. Modify the required fields using the appropriate editors
4. Click **Update** to save changes

### Delete a Ticket
1. Select a row in the grid
2. Click the **Delete** button in the toolbar
3. Confirm the deletion in the dialog

### Search Records
1. Use the **Search** box in the toolbar
2. Enter keywords to filter records (searches across configured columns)

### Filter Records
1. Click the filter icon in any column header
2. Select filter criteria (equals, contains, greater than, etc.)
3. Click **Filter** to apply

### Sort Records
1. Click the column header to sort ascending
2. Click again to sort descending
3. Hold **Shift** and click another column for multi-column sorting

## Architecture Overview

### Backend Flow

1. **Client Request**: React Grid (via CustomAdaptor) sends HTTP POST requests to `/api/tickets` endpoints
2. **Controller**: `TicketsController` receives the request with `DataManagerRequest` parameters
3. **DataOperations**: Syncfusion's `DataOperations` class applies searching, filtering, sorting, and paging to in-memory data
4. **Repository**: `TicketRepository` uses ADO.NET `SqlConnection` / `SqlCommand` to execute parameterized SQL queries
5. **Database**: SQL Server processes the query and returns results
6. **Response**: Data flows back through repository → controller → HTTP response → CustomAdaptor → Grid

### CustomAdaptor

The `CustomAdaptor` extends Syncfusion's `UrlAdaptor` and handles:
- **Read operations**: POST requests with `DataManagerRequest` payload for filtering, sorting, paging
- **CRUD operations**: POST requests wrapping the record in `{ value: data }` for insert/update/delete
- **Batch operations**: POST request with `{ added, changed, deleted }` arrays
- **Response transformation**: Processes server responses into Grid-compatible format

### Repository Pattern with SqlClient

ADO.NET methods used in `TicketRepository`:

| Method | Description |
|--------|-------------|
| `GetTicketsAsync` | Executes a SELECT on `Tickets`, maps rows to `Tickets` objects, returns full list ordered by `TicketId` |
| `GeneratePublicTicketIdAsync` | Finds the current max numeric suffix in `PublicTicketId` (format `NET-####`) and returns the next value |
| `InsertAsync` | Auto-generates `PublicTicketId` if blank, sets timestamps, inserts via `INSERT … SELECT SCOPE_IDENTITY()`, returns entity with new `TicketId` |
| `UpdateAsync` | Updates all mutable fields by `TicketId`, refreshes `UpdatedAt`, returns updated entity |
| `DeleteAsync` | Deletes the ticket matching `TicketId`, returns number of affected rows |

### API Endpoints

| Operation | HTTP Method | Endpoint | Purpose |
|-----------|-------------|----------|---------|
| Read/Filter/Sort/Page | POST | `/api/tickets` | Retrieves data with applied filters, sorting, and paging |
| Insert | POST | `/api/tickets/insert` | Adds a new ticket record |
| Update | POST | `/api/tickets/update` | Updates an existing ticket record |
| Delete | POST | `/api/tickets/remove` | Deletes a ticket record |
| Batch | POST | `/api/tickets/batch` | Handles multiple add, update, and delete operations in a single request |
| Health Check | GET | `/api/tickets/ping` | Verifies the API is running |

## Troubleshooting

### Connection Error
- Verify SQL Server is running and accessible on the specified host
- Confirm the `Data Source`, `Initial Catalog`, and authentication method are correct
- For Windows Authentication, ensure the user account has access to SQL Server
- For SQL Server Authentication, verify the username and password
- Ensure the `NetworkSupportDB` database exists

### Missing Tables
- Verify the SQL script was executed successfully in SQL Server Management Studio
- Run the database creation script again
- Confirm the table name is `[dbo].[Tickets]` with correct schema
- Check that the `UNIQUE` constraint on `PublicTicketId` was created

### CORS Issues
- Verify CORS is configured in `Program.cs` with `app.UseCors()`
- Check that the default policy allows any origin, header, and method
- Clear browser cache and restart both server and client
- Ensure `app.UseCors()` is called before `app.MapControllers()`

### Grid Not Loading Data
- Check the browser console for errors
- Verify the API is running at the configured URL (use `GET /api/tickets/ping` to confirm)
- Test the read endpoint directly using Postman (POST to `/api/tickets` with body `{}`)
- Ensure the `CustomAdaptor` is correctly configured in `App.tsx`

### SqlClient Mapping Issues
- Ensure the `Tickets` model property names match the database column names exactly
- Check that nullable columns (`?`) are handled correctly when reading `DBNull` values
- Verify parameterized queries use the correct SQL parameter types

### PublicTicketId Not Generated
- Confirm `InsertAsync` is being called (not a direct SQL insert)
- Verify the `GeneratePublicTicketIdAsync` method can query the `Tickets` table
- Check that the `PublicTicketId` column has a `UNIQUE` constraint in the database

### Version Conflicts
- Align `Microsoft.Data.SqlClient`, `Syncfusion.EJ2`, and other package versions
- Run `dotnet restore` for server and `npm install` for client to update packages
- Check `package.json` and `.csproj` for conflicting version constraints
- Verify all packages are compatible with .NET 8.0


## Reference
The [user guide](https://ej2.syncfusion.com/react/documentation/grid/connecting-to-database/microsoft-sql-server) provides detailed directions in a clear, step-by-step format.

# Steps to download GitHub samples using DownGit

1. **Open the DownGit Website**

    Go to the official DownGit tool: https://downgit.github.io/#/home

2. **Copy the GitHub URL**

    - Navigate to the sample folder you want to download and copy its URL.
    - Example : https://github.com/SyncfusionExamples/ej2-react-grid-samples/tree/master/connecting-to-database/syncfusion-react-grid-MSSQL

3. **Paste the URL into DownGit**  

    In the DownGit input box, paste the copied GitHub URL.

4. **Download the ZIP**

    - Click **Download**.
    - DownGit will generate a ZIP file of the selected folder, which you can save and extract locally.