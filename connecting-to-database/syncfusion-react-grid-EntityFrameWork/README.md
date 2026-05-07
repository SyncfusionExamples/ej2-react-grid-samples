# React Grid with SQL Server and Entity Framework Core

## Project Overview

This repository demonstrates a production-ready pattern for binding **SQL Server** data to **Syncfusion React Grid** using **Entity Framework Core (EF Core)**. The sample application provides complete CRUD (Create, Read, Update, Delete) operations, filtering, sorting, paging, and batch updates. The implementation follows industry best practices using ASP.NET Core Web API, DbContext, Entity Framework Core, and a custom adaptor for seamless grid-to-server communication.

## Key Features

- **SQL Server–Entity Framework Core Integration**: Models, DbContext, and Entity Framework Core for database operations
- **Syncfusion React Grid**: Built-in search, filter, sort, paging, and toolbar capabilities
- **Complete CRUD Operations**: Add, edit, delete, and batch update ticket records directly from the grid
- **CustomAdaptor Pattern**: Full control over grid data operations with RESTful API communication
- **ASP.NET Core Web API**: RESTful backend service with proper CORS configuration
- **Batch Operations Support**: Efficient handling of multiple add, update, and delete operations
- **Configurable Connection String**: Database credentials managed via **appsettings.json**

## Prerequisites

| Component | Version | Purpose |
|-----------|---------|---------|
| Visual Studio 2022 | 17.0 or later | Development IDE with React and ASP.NET Core workload |
| .NET SDK | .NET 10.0 or later | Runtime and build tools for backend API |
| Node.js | 18.x or later | JavaScript runtime for React development |
| npm | 11.x or later | Package manager |
| SQL Server | 2019 or later | Database server |
| Microsoft.EntityFrameworkCore | 10.0.2 or later | Core framework for database operations |
| Microsoft.EntityFrameworkCore.SqlServer | 10.0.2 or later | SQL Server provider for Entity Framework Core |
| Syncfusion.EJ2.Base | Latest | Backend support for Syncfusion components |
| @syncfusion/ej2-react-grids | Latest | React Grid component |
| @syncfusion/ej2-data | Latest | Data management utilities |

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd syncfusion-react-grid-EntityFrameWork
   ```

2. **Create the database and table**
   
   Open SQL Server Management Studio (SSMS) or SQL Server Express and run:
   ```sql
    -- Create Database
    IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'TicketsDb')
    BEGIN
        CREATE DATABASE TicketsDb;
    END
    GO

    USE TicketsDb;
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
   
   Open (**Grid_EntityFramework.Server/appsettings.json**) and configure the SQL Server connection:
   ```json
    {
        "ConnectionStrings": {
            "TicketsDb": "Server=localhost;Database=TicketsDb;Trusted_Connection=True;TrustServerCertificate=True;"
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
   cd Grid_EntityFramework.Server
   dotnet build
   dotnet run
   ```
   The API will run at `http://localhost:5018` (or the port shown in terminal).

5. **Install client dependencies and run the React app**
   
   Open a new terminal:
   ```bash
   cd grid_entityframework.client
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
| Server | SQL Server instance address | `localhost` or `.\SQLEXPRESS` |
| Database | Database name | `TicketsDb` |
| Trusted_Connection | Windows Authentication | `True` (for local development) |
| TrustServerCertificate | Certificate validation | `True` (for local development) |

**Security Note**: For production environments, store sensitive credentials using:
- User secrets for development
- Environment variables for production
- Azure Key Vault or similar secure storage solutions

For SQL Server Authentication (username/password):
```
Server=your-server;Database=TicketsDb;User ID=sa;Password=<secure-password>;TrustServerCertificate=True
```

### API Base URL

The React client connects to the API server. Update the URL in **grid_entityframework.client/src/App.tsx** if your API runs on a different port:

```typescript
const dataManager = useMemo(() => new DataManager({
  url: 'http://localhost:5018/api/tickets/url',
  insertUrl: 'http://localhost:5018/api/tickets/insert',
  updateUrl: 'http://localhost:5018/api/tickets/update',
  removeUrl: 'http://localhost:5018/api/tickets/remove',
  batchUrl: 'http://localhost:5018/api/tickets/batch',
  adaptor: new CustomAdaptor(),
}), []);
```

## Project Layout

| File/Folder | Purpose |
|-------------|---------|
| **Backend (Grid_EntityFramework.Server)** | |
| `/Models/Ticket.cs` | Entity model representing the Tickets table with EF Core annotations |
| `/Data/TicketsDbContext.cs` | Entity Framework Core DbContext for database operations |
| `/Controllers/TicketsController.cs` | ASP.NET Core Web API controller with CRUD endpoints |
| `/Program.cs` | Service registration, EF Core configuration, and CORS setup |
| `/appsettings.json` | Application configuration including connection string |
| **Frontend (grid_entityframework.client)** | |
| `/src/App.tsx` | Main React component with Grid configuration and DataManager |
| `/src/CustomAdaptor.ts` | Custom data adaptor extending UrlAdaptor for handling grid operations |
| `/src/index.css` | Global CSS styles including Syncfusion theme imports |
| `/src/main.tsx` | React application entry point |
| `/package.json` | NPM dependencies and scripts |
| `/vite.config.ts` | Vite build configuration |

## Common Tasks

### Add a Ticket
1. Click the **Add** button in the grid toolbar
2. Fill in the form fields (Public Ticket ID, Title, Department, Status, Priority, etc.)
3. Click **Update** to persist the record to the database
4. The grid automatically refreshes with the new ticket

### Edit a Ticket
1. Select a row in the grid
2. Click the **Edit** button in the toolbar (or double-click the row)
3. Modify the required fields using the appropriate editors
4. Click **Update** to save changes
5. The database is immediately updated via Entity Framework Core

### Delete a Ticket
1. Select a row in the grid
2. Click the **Delete** button in the toolbar
3. Confirm the deletion
4. The record is removed from the database and grid

### Search Records
1. Use the **Search** box in the toolbar
2. Enter keywords to filter records across configured columns
3. Results are displayed in real-time

### Filter Records
1. Click the filter icon in any column header
2. Select filter criteria (equals, contains, greater than, etc.)
3. Click **Filter** to apply
4. Results are updated on the server and returned to the grid

### Sort Records
1. Click the column header to sort ascending
2. Click again to sort descending
3. Hold **Shift** and click another column for multi-column sorting

### Batch Operations
1. Enable batch mode by setting `mode: 'Batch'` in `editSettings`
2. Make multiple changes (add, edit, delete) in the grid
3. Click **Update** to send all changes in a single batch request
4. All operations are processed together on the server using Entity Framework Core

## Architecture Overview

### Backend Flow

1. **Client Request**: React Grid (via CustomAdaptor) sends HTTP POST requests to `/api/tickets/*` endpoints
2. **Controller**: `TicketsController` receives the request with `DataManagerRequest` parameters
3. **DataOperations**: Syncfusion's `DataOperations` class processes filtering, sorting, and paging
4. **DbContext**: Entity Framework Core executes LINQ queries against the database
5. **Database**: SQL Server processes the query and returns results
6. **Response**: Data flows back through DbContext → controller → HTTP response → CustomAdaptor → Grid

### CustomAdaptor

The `CustomAdaptor` extends Syncfusion's `UrlAdaptor` and handles:
- **Read operations**: POST requests with query parameters for filtering, sorting, paging
- **CRUD operations**: POST requests for insert/update/delete
- **Batch operations**: Handles multiple changes in a single request
- **Response transformation**: Processes server responses into Grid-compatible format (adds SNo field)

### Entity Framework Core Pattern

Entity Framework Core methods and patterns used:

| Method/Pattern | Description |
|----------------|-------------|
| `AsNoTracking()` | Read-only queries for better performance |
| `Add()` | Adds new entities to the context |
| `Entry().State = Modified` | Updates existing entities |
| `Remove()` | Deletes entities from the database |
| `SaveChanges()` | Persists all changes to the database |
| `DataOperations` | Syncfusion utility for applying Grid operations to IQueryable |

### API Endpoints

| Operation | HTTP Method | Endpoint | Purpose |
|-----------|-------------|----------|---------|
| Read/Filter/Sort/Page | POST | `/api/tickets/url` | Retrieves data with applied filters, sorting, and paging |
| Insert | POST | `/api/tickets/insert` | Adds a new ticket record |
| Update | POST | `/api/tickets/update` | Updates an existing ticket record |
| Delete | POST | `/api/tickets/remove` | Deletes a ticket record |
| Batch Operations | POST | `/api/tickets/batch` | Handles multiple add, update, and delete operations in a single request |

## Troubleshooting

### Connection Error
- Verify SQL Server is running and accessible on the specified host
- Confirm the database name and authentication method are correct
- For Windows Authentication, ensure user account has access to SQL Server
- For SQL Server Authentication, verify the username and password
- Ensure the `TicketsDb` database exists

### Missing Tables
- Verify the SQL script was executed successfully in SQL Server Management Studio
- Run the database creation script again
- Confirm the table name is `[dbo].[Tickets]` with correct schema
- Check that the unique constraint on `PublicTicketId` was created

### CORS Issues
- Verify CORS is configured in `Program.cs` with the "dev" policy
- Check that the policy allows the client origin (`AllowAnyOrigin()`)
- Clear browser cache and restart both server and client
- Ensure `app.UseCors("dev")` is called before `app.MapControllers()`

### Grid Not Loading Data
- Check browser console for errors
- Verify the API is running and accessible at the configured URL
- Test the API endpoint directly using Postman or browser (POST to `/api/tickets/url`)
- Ensure the `CustomAdaptor` is correctly configured in `App.tsx`
- Check that Entity Framework Core is properly configured in `Program.cs`

### Entity Framework Mapping Issues
- Ensure the `Ticket` model properties match the database column names
- Check that the DbContext is correctly configured with table and schema
- Verify that the connection string points to the correct database
- Use Entity Framework Core migrations if schema changes are needed

### Identity Column Issues
- Ensure `TicketId` is marked with `[DatabaseGenerated(DatabaseGeneratedOption.Identity)]`
- When inserting, set `ticket.TicketId = 0` to let SQL Server generate the ID
- Verify that the database column has `IDENTITY(1,1)` specified

### JSON Serialization Issues
- The API uses Newtonsoft.Json with `NullValueHandling.Ignore` to prevent null issues
- Ensure the client sends proper JSON structure with `{ value: data }` wrapper
- Check that date/time values are in ISO 8601 format

### Version Conflicts
- Align Entity Framework Core, SQL Server provider, and Syncfusion package versions
- Run `dotnet restore` for server and `npm install` for client to update packages
- Check `package.json` and `.csproj` files for conflicting version constraints
- Ensure all packages are compatible with .NET 10.0

## Reference
The [user guide](https://ej2.syncfusion.com/react/documentation/grid/connecting-to-orm/entity-framework) provides detailed directions in a clear, step-by-step format.

## Reference
The [user guide](https://ej2.syncfusion.com/react/documentation/grid/connecting-to-orm/dapper) provides detailed directions in a clear, step-by-step format.

# Steps to download GitHub samples using DownGit

1. **Open the DownGit Website**

    Go to the official DownGit tool: https://downgit.github.io/#/home
2. **Copy the GitHub URL**

    - Navigate to the sample folder you want to download and copy its URL.
    - Example : https://github.com/SyncfusionExamples/ej2-react-grid-samples/tree/master/connecting-to-database/syncfusion-react-grid-EntityFrameWork

3. **Paste the URL into DownGit**  

    In the DownGit input box, paste the copied GitHub URL.

4. **Download the ZIP**

    - Click **Download**.
    - DownGit will generate a ZIP file of the selected folder, which you can save and extract locally.