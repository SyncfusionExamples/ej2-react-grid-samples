# React Grid with PostgreSQL and Entity Framework Core

## Project Overview

This repository demonstrates a production-ready pattern for binding **PostgreSQL** data to **Syncfusion React Grid** using **Entity Framework Core (EF Core)**. The sample application provides complete CRUD (Create, Read, Update, Delete) operations, filtering, sorting, paging, and batch updates. The implementation follows industry best practices using ASP.NET Core Web API, DbContext, Entity Framework Core with Npgsql provider, and React services for seamless grid-to-server communication.

## Key Features

- **PostgreSQL–Entity Framework Core Integration**: Models, DbContext, and Entity Framework Core with Npgsql provider for database operations
- **Syncfusion React Grid**: Built-in search, filter, sort, paging, and toolbar capabilities
- **Complete CRUD Operations**: Add, edit, delete, and batch update purchase order records directly from the grid
- **DataSourceType Pattern**: Full control over grid data operations with RESTful API communication
- **ASP.NET Core Web API**: RESTful backend service with proper CORS configuration
- **Batch Operations Support**: Efficient handling of multiple add, update, and delete operations
- **Configurable Connection String**: Database credentials managed via **appsettings.json**
- **Cross-Platform Database**: PostgreSQL runs on Windows, Linux, and macOS

## Prerequisites

| Component | Version | Purpose |
|-----------|---------|---------|
| Visual Studio 2022 | 17.0 or later | Development IDE with React and ASP.NET Core workload |
| .NET SDK | 10.0 or later | Runtime and build tools for backend API |
| Node.js | 18.x or later | JavaScript runtime for React development |
| npm | 9.x or later | Package manager |
| PostgreSQL | 12 or later | Open-source relational database server |
| pgAdmin 4 | Latest | PostgreSQL GUI management and administration tool |
| Microsoft.EntityFrameworkCore | 10.0.3 or later | Core framework for database operations |
| Npgsql.EntityFrameworkCore.PostgreSQL | 10.0.3 or later | PostgreSQL provider for Entity Framework Core |
| Syncfusion.EJ2.Base | Latest | Backend support for Syncfusion components |
| @syncfusion/ej2-react-grids | Latest | React Grid component |
| @syncfusion/ej2-data | Latest | Data management utilities |
| React | 18.x or later | JavaScript library for UI development |

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd Grid_PostgreSQL
```

### 2. Create the database and table in PostgreSQL

Connect to PostgreSQL using **pgAdmin 4** or the **psql** command-line tool and execute the following SQL script:

```sql
-- Create Database
CREATE DATABASE "PurchaseOrderDB";

-- Connect to the database
\c "PurchaseOrderDB"

-- Create PurchaseOrder Table
CREATE TABLE public."PurchaseOrder" (
    "PurchaseOrderId" SERIAL PRIMARY KEY,
    "PoNumber" VARCHAR(30) NOT NULL UNIQUE,
    "VendorID" VARCHAR(50) NOT NULL,
    "ItemName" VARCHAR(200) NOT NULL,
    "ItemCategory" VARCHAR(100),
    "Quantity" INTEGER NOT NULL,
    "UnitPrice" NUMERIC(12,2) NOT NULL,
    "TotalAmount" NUMERIC(14,2),
    "Status" VARCHAR(50),
    "OrderedBy" VARCHAR(100),
    "ApprovedBy" VARCHAR(100),
    "OrderDate" DATE NOT NULL,
    "ExpectedDeliveryDate" DATE,
    "CreatedOn" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedOn" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Unique Index on PoNumber
CREATE UNIQUE INDEX uq_purchaseorder_ponumber ON public."PurchaseOrder"("PoNumber");

-- Insert Sample Data (Optional)
INSERT INTO public."PurchaseOrder"
("PoNumber", "VendorID", "ItemName", "ItemCategory", "Quantity", "UnitPrice", "TotalAmount", "Status", "OrderedBy", "ApprovedBy", "OrderDate", "ExpectedDeliveryDate", "CreatedOn", "UpdatedOn")
VALUES
('PO-2025-0001', 'VEN-9001', 'FHD Laptop', 'Electronics', 5, 899.99, 4499.95, 'Pending', 'Alice Johnson', 'Carol Davis', '2025-01-10', '2025-01-20', NOW(), NOW()),
('PO-2025-0002', 'VEN-9002', 'Fibre Cables', 'Networking', 100, 15.50, 1550.00, 'Approved', 'Bob Smith', 'Alice Johnson', '2025-01-09', '2025-01-17', NOW(), NOW());
```

**Using pgAdmin 4 UI:**
1. Open pgAdmin 4 and connect to the PostgreSQL server
2. Right-click on **Databases** → Select **Create** → **Database**
3. Name it `PurchaseOrderDB` and click **Save**
4. Right-click on the database → **Query Tool**
5. Paste the SQL script above and execute it (F5 or Run button)

### 3. Update the connection string

Open **Grid_PostgreSQL.Server/appsettings.json** and configure the PostgreSQL connection:

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
    "DefaultConnection": "Server=localhost;Port=5432;Database=PurchaseOrderDB;User Id=postgres;Password=<your-password>"
  }
}
```

**Connection String Components:**

| Component | Description | Example |
|-----------|-------------|---------|
| Server | PostgreSQL server address | `localhost` or `192.168.1.100` |
| Port | PostgreSQL port (default is 5432) | `5432` |
| Database | Database name | `PurchaseOrderDB` |
| User Id | PostgreSQL username | `postgres` |
| Password | PostgreSQL user password | `Syncfusion@123` |

### 4. Install server dependencies and run the API

Open a terminal and navigate to the server project:

```bash
cd Grid_PostgreSQL.Server
dotnet build
dotnet run
```

The API will run at `https://localhost:7102` (or the port shown in terminal).

### 5. Install client dependencies and run the React app

Open a new terminal:

```bash
cd Grid_PostgreSQL.Client
npm install
npm start
```

The React development server will run at `http://localhost:3000`.

### 6. Open the application

Navigate to `http://localhost:3000` in your browser.

## Configuration

### Connection String

The connection string in **appsettings.json** defines how the application connects to PostgreSQL:

```
Server=localhost;Port=5432;Database=PurchaseOrderDB;User Id=postgres;Password=Syncfusion@123
```

**Security Note:** For production environments, store sensitive credentials using:
- User secrets for development: `dotnet user-secrets set "ConnectionStrings:DefaultConnection" "..."`
- Environment variables for production
- Azure Key Vault or similar secure storage solutions
- Connection string encryption

### Entity Framework Core with PostgreSQL

Entity Framework Core is configured in **Program.cs** to use the **Npgsql** provider:

```csharp
builder.Services.AddDbContext<PurchaseOrderDbContext>(options =>
{
    options.UseNpgsql(connectionString);
    
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});
```

The Npgsql provider bridges EF Core and PostgreSQL, enabling:
- LINQ-to-SQL query translation for PostgreSQL syntax
- Type mapping for PostgreSQL-specific data types (NUMERIC, TIMESTAMP, etc.)
- Constraint management (PRIMARY KEY, UNIQUE, DEFAULT values)
- Automatic migration support

## Project Layout

| File/Folder | Purpose |
|-------------|---------|
| **Backend (Grid_PostgreSQL.Server)** | |
| `Data/PurchaseOrder.cs` | Entity model representing the PurchaseOrder table with EF Core annotations |
| `Data/PurchaseOrderDbContext.cs` | Entity Framework Core DbContext for PostgreSQL database operations |
| `Controllers/PurchaseOrderController.cs` | ASP.NET Core Web API controller with CRUD endpoints |
| `Program.cs` | Service registration, EF Core with Npgsql configuration, and CORS setup |
| `appsettings.json` | Application configuration including PostgreSQL connection string |
| **Frontend (Grid_PostgreSQL.Client)** | |
| `src/index.js` | React DOM render entry point |
| `src/App.jsx` | Syncfusion Grid component with CRUD operations |
| `src/App.css` | Global CSS styles including Syncfusion theme imports |
| `package.json` | NPM dependencies and scripts |
| `public/index.html` | HTML entry point |

## Common Tasks

### Add a Purchase Order
1. Click the **Add** button in the grid toolbar
2. Fill in the form fields (PO Number, Vendor ID, Item Name, Quantity, Unit Price, etc.)
3. Click **Update** to persist the record to PostgreSQL
4. The grid automatically refreshes with the new purchase order

### Edit a Purchase Order
1. Select a row in the grid
2. Click the **Edit** button in the toolbar (or double-click the row)
3. Modify the required fields using the appropriate editors
4. Click **Update** to save changes
5. PostgreSQL is immediately updated via Entity Framework Core

### Delete a Purchase Order
1. Select a row in the grid
2. Click the **Delete** button in the toolbar
3. Confirm the deletion
4. The record is removed from PostgreSQL and the grid

### Search Records
1. Use the **Search** box in the toolbar
2. Enter keywords to filter records across configured columns
3. Results are displayed in real-time from PostgreSQL

### Filter Records
1. Click the filter icon in any column header
2. Select filter criteria (equals, contains, greater than, etc.)
3. Click **Filter** to apply
4. Results are filtered on the server using PostgreSQL queries

### Sort Records
1. Click the column header to sort ascending
2. Click again to sort descending
3. Hold **Shift** and click another column for multi-column sorting

### Batch Operations
1. Enable batch mode by setting `editSettings={{ mode: 'Batch' }}` in Grid component
2. Make multiple changes (add, edit, delete) in the grid
3. Click **Update** to send all changes in a single batch request
4. All operations are processed together on PostgreSQL using Entity Framework Core

## Architecture Overview

### Backend Data Flow

1. **Client Request**: React Grid sends HTTP POST requests to `/api/PurchaseOrder/*` endpoints
2. **Controller**: `PurchaseOrderController` receives the request with `DataManagerRequest` parameters
3. **DataOperations**: Syncfusion's `DataOperations` class processes filtering, sorting, and paging
4. **DbContext**: Entity Framework Core translates LINQ queries to PostgreSQL SQL syntax
5. **Database**: PostgreSQL executes the query and returns results
6. **Response**: Data flows back through DbContext → controller → HTTP response → React Grid

### Data Service Pattern

The **API Service** intercepts data operations and handles:
- **Read operations**: POST requests with query parameters for filtering, sorting, paging
- **CRUD operations**: POST requests for insert/update/delete
- **Batch operations**: Handles multiple changes in a single request
- **Response transformation**: Processes server responses into Grid-compatible format

### API Endpoints

| Operation | HTTP Method | Endpoint | Purpose |
|-----------|-------------|----------|---------|
| Read/Filter/Sort/Page | POST | `/api/PurchaseOrder/getpurchasedata` | Retrieves data with applied filters, sorting, and paging |
| Insert | POST | `/api/PurchaseOrder/insert` | Adds a new purchase order record |
| Update | POST | `/api/PurchaseOrder/update` | Updates an existing purchase order record |
| Delete | POST | `/api/PurchaseOrder/remove` | Deletes a purchase order record |
| Batch Operations | POST | `/api/PurchaseOrder/batch` | Handles multiple add, update, and delete operations in a single request |

## Troubleshooting

### PostgreSQL Connection Error
- Verify PostgreSQL is running and accessible on the specified host and port
- Confirm the database name, username, and password are correct
- Test connection using `psql` command: `psql -h localhost -U postgres -d PurchaseOrderDB`
- Ensure the firewall allows connections on port 5432
- Check `appsettings.json` connection string syntax

### Missing Tables
- Verify the SQL script was executed successfully in pgAdmin 4
- Run the database creation script again
- Confirm the table name is `public."PurchaseOrder"` with correct schema
- Check that the unique constraint on `PoNumber` was created
- Query the table: `SELECT * FROM public."PurchaseOrder";`

### Entity Framework Core Mapping Issues
- Ensure the `PurchaseOrder` model properties match the database column names exactly
- Check that the DbContext is correctly configured with `ToTable("PurchaseOrder", schema: "public")`
- Verify column type mappings: `HasColumnType("character varying(30)")`, `HasColumnType("numeric(14,2)")`, etc.
- Use `HasMaxLength()` for string properties to match VARCHAR limits
- Ensure the connection string points to the correct database

### CORS Issues
- Verify CORS is configured in `Program.cs` with `AddDefaultPolicy()`
- Check that the policy allows the client origin (`AllowAnyOrigin()` or specific origins)
- Clear browser cache and restart both server and client
- Ensure `app.UseCors()` is called before `app.MapControllers()`
- Check browser console for CORS error details

### Grid Not Loading Data
- Check browser console for errors (F12)
- Verify the API is running and accessible at the configured URL
- Test the API endpoint directly using Postman: POST to `https://localhost:7102/api/PurchaseOrder/getpurchasedata`
- Ensure the DataManager is correctly configured with the API URL
- Check that Entity Framework Core DbContext is properly registered in `Program.cs`
- Verify `appsettings.json` has the correct connection string
- Confirm environment variables are properly set in the React app

### React Environment Variables Not Loading
- Ensure `.env` file is in the React project root directory
- Variables must start with `REACT_APP_` prefix to be accessible via `process.env`
- Restart the React development server after modifying `.env` file
- Check that `process.env.REACT_APP_API_URL` is used correctly in your code

### Identity Column Issues
- Ensure `PurchaseOrderId` is marked as SERIAL PRIMARY KEY in PostgreSQL
- When inserting, the ID is auto-generated by PostgreSQL (no need to set)
- Verify that the DbContext property is marked with `ValueGeneratedOnAdd()`

### JSON Serialization Issues
- The API uses `PropertyNamingPolicy = null` to preserve PascalCase
- Ensure the client sends proper JSON structure matching the model
- Check that date/time values are in ISO 8601 format or use JSON converters
- Verify nullable reference types are properly handled on both backend and frontend

### Type Mismatch Issues
- DateTimeOffset: Used for `CreatedOn` and `UpdatedOn` to store timezone-aware timestamps
- DateTime: Used for `OrderDate` and `ExpectedDeliveryDate` (date only)
- NUMERIC(12,2): Used for `UnitPrice` with 12 digits total, 2 decimal places
- NUMERIC(14,2): Used for `TotalAmount` with 14 digits total, 2 decimal places

### Version Conflicts
- Ensure Entity Framework Core, Npgsql provider, and React packages are compatible versions
- Run `dotnet restore` for server and `npm install` for client to update packages
- Check `.csproj` and `package.json` files for conflicting version constraints
- Verify all packages are compatible with .NET 10.0, Node.js 18.x+, and React 18.x+

### API Port Conflicts
- If port 7102 is already in use, the .NET API will use a different port
- Check the console output running `dotnet run` to see the actual port
- Update the `REACT_APP_API_URL` in `.env` to match the actual API port
- Clear cached values and restart the React development server

### Performance Optimization
- Use `AsNoTracking()` for read-only queries to improve performance
- Create database indexes on frequently filtered/sorted columns
- Use paging to avoid loading all records at once
- Consider connection pooling in production environments
- Monitor query performance using PostgreSQL query logs
- Implement React component memoization to prevent unnecessary re-renders
- Use lazy loading for grid data with virtual scrolling enabled

## Steps to Download Using DownGit

1. **Open the DownGit Website**
   
   Go to: https://downgit.github.io/#/home

2. **Copy the GitHub URL**
   
   - Navigate to the sample folder and copy its URL
   - Example: https://github.com/SyncfusionExamples/ej2-react-grid-samples/tree/master/connecting-to-database/syncfusion-react-grid-postgresql

3. **Paste the URL into DownGit**
   
   In the DownGit input box, paste the copied GitHub URL

4. **Download the ZIP**
   
   - Click **Download**
   - DownGit will generate a ZIP file of the selected folder which you can extract locally
