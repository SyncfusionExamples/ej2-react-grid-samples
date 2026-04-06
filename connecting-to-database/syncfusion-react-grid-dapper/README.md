# React Grid with SQL Server and Dapper

## Project Overview

This repository demonstrates a production-ready pattern for binding **SQL Server** data to **Syncfusion React Grid** using **Dapper ORM**. The sample application provides complete CRUD (Create, Read, Update, Delete) operations, filtering, sorting, paging, and batch updates. The implementation follows industry best practices using ASP.NET Core Web API, Dapper micro-ORM, repository pattern, and a custom adaptor for seamless grid functionality.

## Key Features

- **SQL Server–Dapper Integration**: Lightweight and high-performance data access using Dapper with SQL Server
- **Syncfusion React Grid**: Built-in search, filter, sort, paging, and toolbar capabilities
- **Complete CRUD Operations**: Add, edit, delete, and batch update records directly from the grid
- **Repository Pattern**: Clean separation of concerns with dependency injection support
- **CustomAdaptor**: Full control over grid data operations (read, search, filter, sort, page)
- **ASP.NET Core Web API**: RESTful backend service with proper CORS configuration
- **Configurable Connection String**: Database credentials managed via **appsettings.json**

## Prerequisites

| Component | Version | Purpose |
|-----------|---------|---------|
| Visual Studio 2022 | 17.0 or later | Development IDE with React and ASP.NET Core workload |
| .NET SDK | .NET 10.0 or later | Runtime and build tools for backend API |
| Node.js | 18.x or later | JavaScript runtime for React development |
| npm | 11.x or later | Package manager |
| SQL Server | 2019 or later | Database server |
| Dapper | 2.1.66 or later | Lightweight micro-ORM for SQL mapping |
| Microsoft.Data.SqlClient | Latest | SQL Server data provider |
| Syncfusion.EJ2.AspNet.Core | Latest | Backend support for Syncfusion components |
| @syncfusion/ej2-react-grids | Latest | React Grid component |
| @syncfusion/ej2-data | Latest | Data management utilities |

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd syncfusion-react-grid-dapper
   ```

2. **Create the database and table**
   
   Open SQL Server Management Studio or SQL Server Express and run:
    ```sql
    -- Create Database if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = N'HotelBookingDB')
    BEGIN
        CREATE DATABASE HotelBookingDB;
    END
    GO

    USE HotelBookingDB;
    GO

    -- Create Rooms table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = N'Rooms' AND schema_id = SCHEMA_ID(N'dbo'))
    BEGIN
        CREATE TABLE dbo.Rooms (
            Id INT IDENTITY(1,1) PRIMARY KEY,
            ReservationId VARCHAR(50) NOT NULL,
            GuestName VARCHAR(100) NOT NULL,
            GuestEmail VARCHAR(250) NULL,
            CheckInDate DATE NOT NULL,
            CheckOutDate DATE NULL,
            RoomType VARCHAR(100) NULL,
            RoomNumber VARCHAR(20) NULL,
            AmountPerDay DECIMAL(18,2) NULL,
            NoOfDays INT NULL,
            TotalAmount DECIMAL(18,2) NULL,
            PaymentStatus VARCHAR(50) NOT NULL,
            ReservationStatus VARCHAR(50) NOT NULL
        );
    END
    GO

    -- Insert Sample Data (Optional).
    IF NOT EXISTS (SELECT 1 FROM dbo.Rooms WHERE ReservationId IN (N'RES001001', N'RES001002'))
    BEGIN
        INSERT INTO dbo.Rooms
            (ReservationId, GuestName, GuestEmail, CheckInDate, CheckOutDate, RoomType, RoomNumber, AmountPerDay, NoOfDays, TotalAmount, PaymentStatus, ReservationStatus)
        VALUES
            (N'RES001001', N'John Doe', N'john.doe@example.com', '2026-01-13', '2026-01-15', N'Deluxe Suite', N'D-204', 150.00, 2, 300.00, N'Paid', N'Confirmed'),
            (N'RES001002', N'Mary Smith', N'mary.smith@example.com', '2026-01-14', '2026-01-17', N'Standard Room', N'S-108', 90.00, 3, 270.00, N'Pending', N'Confirmed');
    END
    GO
   ```

3. **Update the connection string**
   
   Open **Grid_Dapper.Server/appsettings.json** and configure the SQL Server connection:
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
            "HotelBookingDB": "Server=(localdb)\\MSSQLLocalDB;Database=HotelBookingDB;Trusted_Connection=True;TrustServerCertificate=True;"
        }
    }
    ```

4. **Install server dependencies and run the API**

   ```bash
   cd Grid_Dapper.Server
   dotnet build
   dotnet run
   ```
   The API will run at `https://localhost:7225` (or the port shown in terminal).

5. **Install client dependencies and run the React app**
   
   Open a new terminal:
   ```bash
   cd grid_dapper.client
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
| Database | Database name | `HotelBookingDB` |
| Trusted_Connection | Windows Authentication | `True` (for local development) |
| TrustServerCertificate | Certificate validation | `True` (for local development) |

**Security Note**: For production environments, store sensitive credentials using:
- User secrets for development
- Environment variables for production
- Azure Key Vault or similar secure storage solutions

For SQL Server Authentication (username/password):
```
Server=your-server;Database=HotelBookingDB;User ID=sa;Password=<secure-password>;TrustServerCertificate=True
```

### API Base URL

The React client connects to the API server. Update the `BASE_URL` in **grid_dapper.client/src/App.tsx** if your API runs on a different port:

```typescript
const BASE_URL = 'https://localhost:7225/api/rooms';
```

## Project Layout

| File/Folder | Purpose |
|-------------|---------|
| **Backend (Grid_Dapper.Server)** | |
| `/Data/Reservation.cs` | Entity model representing the Rooms table |
| `/Data/ReservationRepository.cs` | Repository class providing CRUD methods using Dapper |
| `/Controllers/RoomsController.cs` | ASP.NET Core Web API controller handling HTTP requests |
| `/Program.cs` | Service registration, CORS configuration, and app setup |
| `/appsettings.json` | Application configuration including connection string |
| **Frontend (grid_dapper.client)** | |
| `/src/App.tsx` | Main React component with Grid configuration |
| `/src/CustomAdaptor.ts` | Custom data adaptor for handling grid operations |
| `/src/index.css` | Global CSS styles including Syncfusion theme imports |
| `/src/main.tsx` | React application entry point |
| `/package.json` | NPM dependencies and scripts |
| `/vite.config.ts` | Vite build configuration |

## Common Tasks

### Add a Reservation
1. Click the **Add** button in the grid toolbar
2. Fill in the form fields (Guest Name, Email, Check-In Date, Room Type, etc.)
3. Click **Save** to persist the record to the database

### Edit a Reservation
1. Select a row in the grid
2. Click the **Edit** button in the toolbar (or double-click the row)
3. Modify the required fields
4. Click **Update** to save changes

### Delete a Reservation
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

1. **Client Request**: React Grid (via CustomAdaptor) sends HTTP POST requests to `/api/rooms` endpoints
2. **Controller**: `RoomsController` receives the request and extracts `DataManagerRequest` parameters
3. **Repository**: `ReservationRepository` uses Dapper to execute parameterized SQL queries
4. **Database**: SQL Server processes the query and returns results
5. **Response**: Data flows back through repository → controller → HTTP response → CustomAdaptor → Grid

### CustomAdaptor

The `CustomAdaptor` extends Syncfusion's `UrlAdaptor` and handles:
- **Read operations**: GET with query parameters for filtering, sorting, paging
- **CRUD operations**: POST requests for insert/update/delete
- **Batch operations**: Handles multiple changes in a single request
- **Response transformation**: Processes server responses into Grid-compatible format

### Repository Pattern with Dapper

Dapper extension methods used in the repository:

| Method | Description |
|--------|-------------|
| `QueryAsync<T>` | Executes SELECT queries and maps results to `IEnumerable<T>` |
| `ExecuteScalarAsync<T>` | Executes queries and returns a single scalar value (e.g., new ID) |
| `ExecuteAsync` | Executes INSERT/UPDATE/DELETE and returns affected row count |

## Troubleshooting

### Connection Error
- Verify SQL Server is running and accessible on the specified host
- Confirm the database name and authentication method are correct
- For Windows Authentication, ensure user account has access to SQL Server
- For SQL Server Authentication, verify the username and password
- Ensure the `HotelBookingDB` database exists

### Missing Tables
- Verify the SQL script was executed successfully in SQL Server Management Studio
- Run the database creation script again
- Confirm the table name is `[dbo].[Rooms]` with correct schema

### CORS Issues
- Verify CORS is configured in `Program.cs` with `app.UseCors()`
- Check that the policy allows the client origin
- Clear browser cache and restart both server and client

### Grid Not Loading Data
- Check browser console for errors
- Verify the API is running and accessible at the configured URL
- Test the API endpoint directly using Postman or browser
- Ensure the `CustomAdaptor` is correctly configured in `App.tsx`

### Dapper Mapping Issues
- Ensure column names in the SQL query match the `Reservation` model property names
- Dapper mapping is case-insensitive by default but type-sensitive
- Use column aliases if database column names differ from model properties

### Version Conflicts
- Align Dapper, Microsoft.Data.SqlClient, and Syncfusion package versions
- Run `dotnet restore` for server and `npm install` for client to update packages
- Check `package.json` and `.csproj` files for conflicting version constraints

## Reference
The [user guide](https://ej2.syncfusion.com/react/documentation/grid/connecting-to-orm/dapper) provides detailed directions in a clear, step-by-step format.

# Steps to download GitHub samples using DownGit

1. **Open the DownGit Website**

    Go to the official DownGit tool: https://downgit.github.io/#/home

2. **Copy the GitHub URL**

    - Navigate to the sample folder you want to download and copy its URL.
    - Example : https://github.com/SyncfusionExamples/ej2-react-grid-samples/tree/master/connecting-to-database/syncfusion-react-grid-dapper

3. **Paste the URL into DownGit**  

    In the DownGit input box, paste the copied GitHub URL.

4. **Download the ZIP**

    - Click **Download**.
    - DownGit will generate a ZIP file of the selected folder, which you can save and extract locally.