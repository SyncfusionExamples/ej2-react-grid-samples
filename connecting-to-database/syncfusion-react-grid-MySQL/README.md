# React Grid with MySQL and LINQ2DB

## Project Overview

This repository demonstrates a production-ready pattern for binding **MySQL Server** data to **Syncfusion React Grid** using **LINQ2DB lightweight ORM**. The sample application provides complete CRUD (Create, Read, Update, Delete) operations, filtering, sorting, paging, and batch updates. The implementation follows industry best practices using ASP.NET Core Web API, LINQ2DB for type-safe database queries, and a custom adaptor for seamless grid-to-server communication.

## Key Features

- **MySQL–LINQ2DB Integration**: Type-safe LINQ queries with minimal overhead compared to full ORMs like Entity Framework
- **Syncfusion React Grid**: Built-in search, filter, sort, paging, and toolbar capabilities
- **Complete CRUD Operations**: Add, edit, delete, and batch update transaction records directly from the grid
- **Lightweight ORM**: LINQ2DB provides fast, efficient database access with built-in parameterization
- **CustomAdaptor**: Full control over grid data operations (read, search, filter, sort, page)
- **ASP.NET Core Web API**: RESTful backend service with proper CORS configuration
- **Batch Transaction Support**: Database transactions ensure data consistency across batch operations
- **Configurable Connection String**: Database credentials managed via **appsettings.json**

## Prerequisites

| Component | Version | Purpose |
|-----------|---------|---------|
| Visual Studio 2022 | 17.0 or later | Development IDE with React and ASP.NET Core workload |
| .NET SDK | 8.0 or later | Runtime and build tools for backend API |
| Node.js | 18.x or later | JavaScript runtime for React development |
| npm | 11.x or later | Package manager |
| MySQL Server | 8.0.41 or later | Database server |
| linq2db | 6.1.0 or later | Lightweight ORM for database operations |
| linq2db.MySql | 6.1.0 or later | MySQL provider for LINQ2DB |
| MySqlConnector | 2.5.0 or later | Modern MySQL connector for .NET |
| Syncfusion.EJ2.Base | Latest | Server helpers (DataManagerRequest, QueryableOperation) |
| @syncfusion/ej2-react-grids | Latest | React Grid component |
| @syncfusion/ej2-data | Latest | Data management utilities |

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd syncfusion-react-grid-MySQL
   ```

2. **Create the database and table**

   Open MySQL Workbench or MySQL Command Line Client and run:
   ```sql
   -- Create Database
   CREATE DATABASE IF NOT EXISTS transactiondb
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_general_ci;
   USE transactiondb;

   -- Create Transactions Table
   CREATE TABLE IF NOT EXISTS transactions (
       Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
       TransactionId VARCHAR(50) NOT NULL,
       CustomerId INT NOT NULL,
       OrderId INT,
       InvoiceNumber VARCHAR(50),
       Description VARCHAR(500),
       Amount DECIMAL(18, 2) NOT NULL,
       CurrencyCode VARCHAR(10),
       TransactionType VARCHAR(50),
       PaymentGateway VARCHAR(100),
       CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
       CompletedAt DATETIME,
       Status VARCHAR(50)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

   -- Insert Sample Data (Optional)
   INSERT INTO transactions 
     (TransactionId, CustomerId, OrderId, InvoiceNumber, Description, Amount, CurrencyCode, TransactionType, PaymentGateway, CreatedAt, CompletedAt, Status)
   VALUES
     ('TXN260113001', 1001, 50001, 'INV-2026-001', 'Samsung S25 Ultra', 153399.00, 'INR', 'SALE', 'Razorpay', '2026-01-13 10:15:30', '2026-01-13 10:16:55', 'SUCCESS'),
     ('TXN260113002', 1002, 50002, 'INV-2026-002', 'MacBook Pro M4', 224199.00, 'INR', 'SALE', 'Stripe', '2026-01-13 11:20:10', '2026-01-13 11:21:40', 'SUCCESS');
   ```

3. **Update the connection string**

   Open **Grid_MySQL.Server/appsettings.json** and configure the MySQL connection:
   ```json
   {
     "ConnectionStrings": {
       "MySqlConn": "Server=localhost;Port=3306;Database=transactiondb;User Id=root;Password=<your-password>;SslMode=None;"
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
   cd Grid_MySQL.Server
   dotnet restore
   dotnet build
   dotnet run
   ```
   The API will run at `http://localhost:5283` (or the port shown in terminal).

5. **Install client dependencies and run the React app**

   Open a new terminal:
   ```bash
   cd grid_mysql.client
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
| Server | MySQL server address | `localhost` or `192.168.1.100` |
| Port | MySQL port number | `3306` |
| Database | Database name | `transactiondb` |
| User Id | MySQL username | `root` |
| Password | MySQL password | `<secure-password>` |
| SslMode | SSL encryption mode | `None` (for local dev), `Preferred` (for production) |

**Security Note**: For production environments, store sensitive credentials using:
- User secrets for development
- Environment variables for production
- Azure Key Vault or similar secure storage solutions

Example for production with SSL:
```
Server=your-mysql-server.com;Port=3306;Database=transactiondb;User Id=admin;Password=<secure-password>;SslMode=Preferred;
```

### API Base URL

The React client connects to the API server. Update the URL in `grid_mysql.client/src/App.tsx` if your API runs on a different port:

```typescript
const dataManager = new DataManager({
  url: 'http://localhost:5283/api/grid/url',
  insertUrl: 'http://localhost:5283/api/grid/insert',
  updateUrl: 'http://localhost:5283/api/grid/update',
  removeUrl: 'http://localhost:5283/api/grid/remove',
  batchUrl: 'http://localhost:5283/api/grid/batch',
  adaptor: new CustomAdaptor(),
});
```

## Project Layout

| File/Folder | Purpose |
|-------------|---------|
| **Backend (Grid_MySQL.Server)** | |
| `/Models/Transaction.cs` | Entity model representing the transactions table with LINQ2DB attributes |
| `/Data/AppDataConnection.cs` | LINQ2DB DataConnection class for MySQL database communication |
| `/Controllers/GridController.cs` | ASP.NET Core Web API controller with CRUD, batch, and query endpoints |
| `/Program.cs` | Service registration, LINQ2DB configuration, and CORS setup |
| `/appsettings.json` | Application configuration including MySQL connection string |
| **Frontend (grid_mysql.client)** | |
| `/src/App.tsx` | Main React component with Grid configuration and column definitions |
| `/src/CustomAdaptor.ts` | Custom data adaptor extending UrlAdaptor for handling grid operations |
| `/src/index.css` | Global CSS styles including Syncfusion theme imports |
| `/src/main.tsx` | React application entry point |
| `/package.json` | NPM dependencies and scripts |
| `/vite.config.ts` | Vite build configuration |

## Common Tasks

### Add a Transaction
1. Click the **Add** button in the grid toolbar
2. Fill in the form fields (Transaction ID, Customer ID, Amount, Status, etc.)
3. Click **Update** to persist the record to the database
4. The `CreatedAt` timestamp is automatically set to the current UTC time

### Edit a Transaction
1. Select a row in the grid
2. Click the **Edit** button in the toolbar (or double-click the row)
3. Modify the required fields using the appropriate editors
4. Click **Update** to save changes

### Delete a Transaction
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

1. **Client Request**: React Grid (via CustomAdaptor) sends HTTP POST requests to `/api/grid/*` endpoints
2. **Controller**: `GridController` receives the request with `DataManagerRequest` parameters
3. **QueryableOperation**: Syncfusion's helper class applies searching, filtering, sorting, and paging to IQueryable
4. **DataConnection**: `AppDataConnection` uses LINQ2DB to execute queries against MySQL
5. **Database**: MySQL Server processes the query and returns results
6. **Response**: Data flows back through DataConnection → controller → HTTP response → CustomAdaptor → Grid

### CustomAdaptor

The `CustomAdaptor` extends Syncfusion's `UrlAdaptor` and handles:
- **Read operations**: POST requests with `DataManagerRequest` payload for filtering, sorting, paging
- **CRUD operations**: POST requests wrapping records with proper key handling
- **Batch operations**: POST request with `{ added, changed, deleted }` arrays using database transactions
- **Response transformation**: Processes server responses into Grid-compatible format

### LINQ2DB with MySQL

LINQ2DB features used in `AppDataConnection`:

| Feature | Description |
|---------|-------------|
| `UseMySql()` | Configures LINQ2DB for MySQL 8.0+ with MySqlConnector provider |
| `GetTable<T>()` | Returns an `ITable<T>` for LINQ queries against a database table |
| `FromSql<T>()` | Executes raw SQL queries (used for complex operations) |
| `InsertWithInt32IdentityAsync()` | Inserts a record and returns the auto-generated primary key |
| `UpdateAsync()` | Updates an entity and returns affected row count |
| `DeleteAsync()` | Deletes records matching a condition |
| `BeginTransactionAsync()` | Starts a database transaction for batch operations |

### API Endpoints

| Operation | HTTP Method | Endpoint | Purpose |
|-----------|-------------|----------|---------|
| Read/Filter/Sort/Page | POST | `/api/grid/url` | Retrieves data with applied filters, sorting, and paging |
| Insert | POST | `/api/grid/insert` | Adds a new transaction record |
| Update | POST | `/api/grid/update` | Updates an existing transaction record |
| Delete | POST | `/api/grid/remove` | Deletes a transaction record by ID |
| Batch | POST | `/api/grid/batch` | Handles multiple add, update, and delete operations in a single transaction |

## Troubleshooting

### Connection Error
- Verify MySQL Server is running and accessible at `localhost:3306`
- Confirm the database name, username, and password are correct
- Test the connection using MySQL Command Line or Workbench
- Ensure the `transactiondb` database exists
- Check that the user has permission to access the database

### Missing Tables
- Verify the SQL script was executed successfully in MySQL Workbench
- Run the table creation script again if needed
- Confirm the table name is `transactions` in the `transactiondb` database
- Check that the `Id` column has `AUTO_INCREMENT` specified

### CORS Issues
- Verify CORS is configured in `Program.cs` with `app.UseCors("cors")`
- Check that the policy allows any origin with `AllowAnyOrigin()`
- Clear browser cache and restart both server and client
- Ensure `app.UseCors("cors")` is called before `app.MapControllers()`

### Grid Not Loading Data
- Check the browser console for errors
- Verify the API is running at the configured URL
- Test the API endpoint directly using Postman (POST to `/api/grid/url` with body `{}`)
- Ensure the `CustomAdaptor` is correctly configured in `App.tsx`
- Check that LINQ2DB is properly configured with MySQL in `AppDataConnection`

### LINQ2DB Mapping Issues
- Ensure the `Transaction` model properties match the database column names
- Check that LINQ2DB attributes (`[Table]`, `[Column]`, `[PrimaryKey]`, `[Identity]`) are correct
- Verify nullable properties are marked with `?` in the model
- Use `[NotNull]` attribute for non-nullable columns

### Identity/Auto-Increment Issues
- Ensure the `Id` column is marked with `[PrimaryKey, Identity]` in the model
- Verify the database column has `AUTO_INCREMENT` specified
- Check that `InsertWithInt32IdentityAsync()` is used for inserts (not standard `Insert()`)
- Confirm the returned `Id` is properly assigned back to the inserted entity

### Batch Transaction Failures
- Check that the batch endpoint properly uses `BeginTransactionAsync()`
- Verify `CommitAsync()` is called after all operations
- Ensure each operation in batch (added, changed, deleted) is properly handled
- Check that the `Id` is correctly set before updates and deletes

### MySQL Character Encoding Issues
- Ensure the database is created with `CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`
- Verify the connection string does not have conflicting character set settings
- Check that table columns have `utf8mb4` charset specified

### Version Conflicts
- Align `linq2db`, `linq2db.MySql`, `MySqlConnector`, and Syncfusion package versions
- Run `dotnet restore` for server and `npm install` for client to update packages
- Check `package.json` and `.csproj` for conflicting version constraints
- Verify all packages are compatible with .NET 8.0

### Port Already in Use
- If port 5283 or 5173 is in use, modify the port in:
  - Server: `Grid_MySQL.Server/Properties/launchSettings.json` (change `applicationUrl`)
  - Client: `grid_mysql.client/vite.config.ts` and update API URLs in `App.tsx`

## Reference
The [user guide](https://ej2.syncfusion.com/react/documentation/grid/connecting-to-database/mysql-server) provides detailed directions in a clear, step-by-step format.

# Steps to download GitHub samples using DownGit

1. **Open the DownGit Website**

    Go to the official DownGit tool: https://downgit.github.io/#/home

2. **Copy the GitHub URL**

    - Navigate to the sample folder you want to download and copy its URL.
    - Example : https://github.com/SyncfusionExamples/ej2-react-grid-samples/tree/master/connecting-to-database/syncfusion-react-grid-MySQL

3. **Paste the URL into DownGit**  

    In the DownGit input box, paste the copied GitHub URL.

4. **Download the ZIP**

    - Click **Download**.
    - DownGit will generate a ZIP file of the selected folder, which you can save and extract locally.