# React Grid with MySQL and Stored Procedures

## Project Overview

This repository demonstrates a production-ready pattern for binding **MySQL Server** data to **Syncfusion React Grid** using **stored procedures** and **LINQ2DB** (lightweight ORM). The sample application provides complete CRUD (Create, Read, Update, Delete) operations, filtering, sorting, paging, and searching with **UrlAdaptor** for server-side data operations. The implementation follows industry best practices using stored procedures for enhanced security, performance, and maintainability in a Transaction Management Application.

## Key Features

- **MySQL Stored Procedures Integration**: Precompiled SQL procedures for enhanced security and performance
- **LINQ2DB ORM**: Lightweight ORM with MySqlConnector for efficient database operations
- **Syncfusion React Grid**: Built-in search, filter, sort, and paging capabilities with UrlAdaptor
- **Complete CRUD Operations**: Add, edit, delete, and batch update records directly from the grid
- **Server-Side Data Operations**: All filtering, sorting, and paging executed on the database server
- **SQL Injection Prevention**: Parameterized stored procedures and safe SQL clause building
- **Configurable Connection String**: Database credentials managed via `appsettings.json`

## Prerequisites

| Component | Version | Purpose |
|-----------|---------|---------|
| Visual Studio 2022 | 17.0 or later | Development IDE with ASP.NET Core workload |
| .NET SDK | net8.0 or compatible | Runtime and build tools |
| MySQL Server | 8.0.41 or later | Database server |
| linq2db | 6.1.0 or later | Lightweight ORM for database operations |
| linq2db.MySql | 6.1.0 or later | MySQL provider for LINQ2DB |
| MySqlConnector | 2.5.0 or later | Modern MySQL connector for .NET |
| Node.js | v20.x or later | JavaScript runtime for server-side and build tooling |
| npm/yarn | Latest stable | Package management |

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd syncfusion-react-grid-MySQL-Stored-Procedures
   ```

2. **Create the database, table, and stored procedures**
   
   Open MySQL Workbench or any MySQL client and run:
   ```sql
   -- Create database
   CREATE DATABASE IF NOT EXISTS transactiondb
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_general_ci;
   USE transactiondb;

   -- Create table
   CREATE TABLE IF NOT EXISTS transactions (
     Id               INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
     TransactionId    VARCHAR(50) NOT NULL,
     CustomerId       INT NOT NULL,
     OrderId          INT NOT NULL,
     InvoiceNumber    VARCHAR(50) NULL,
     Description      VARCHAR(500) NULL,
     Amount           DECIMAL(18, 2) NULL,
     CurrencyCode     VARCHAR(10) NULL,
     TransactionType  VARCHAR(50) NULL,
     PaymentGateway   VARCHAR(50) NULL,
     CreatedAt        DATETIME NULL,
     CompletedAt      DATETIME NULL,
     Status           VARCHAR(50) NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

   -- Create stored procedures
   DELIMITER $$

   -- 1) GetTransactions - paged read with search/filter/sort
   CREATE OR REPLACE PROCEDURE GetTransactions(
     IN  p_SearchClause NVARCHAR(4000),
     IN  p_WhereClause  NVARCHAR(4000),
     IN  p_SortClause   NVARCHAR(1000),
     IN  p_Skip         INT,
     IN  p_Take         INT,
     OUT p_TotalCount   INT
   )
   BEGIN
     SET @base = ' FROM transactions t WHERE 1=1 ';
     SET @search = IFNULL(p_SearchClause, '');
     SET @where  = IFNULL(p_WhereClause, '');
     SET @sort   = IFNULL(p_SortClause, 'Id DESC');
     
     SET @sql = CONCAT('SELECT COUNT(*) INTO @cnt ', @base, @search, @where);
     PREPARE stmt FROM @sql;
     EXECUTE stmt;
     DEALLOCATE PREPARE stmt;
     SET p_TotalCount = @cnt;
     
     SET @sql2 = CONCAT(
       'SELECT * ', @base, @search, @where,
       ' ORDER BY ', @sort,
       ' LIMIT ', p_Skip, ', ', p_Take
     );
     PREPARE stmt2 FROM @sql2;
     EXECUTE stmt2;
     DEALLOCATE PREPARE stmt2;
   END $$

   -- 2) InsertTransaction - insert and return new Id
   CREATE OR REPLACE PROCEDURE InsertTransaction(
     IN  p_TransactionId    NVARCHAR(50),
     IN  p_CustomerId       INT,
     IN  p_OrderId          INT,
     IN  p_InvoiceNumber    NVARCHAR(50),
     IN  p_Description      NVARCHAR(500),
     IN  p_Amount           DECIMAL(18,2),
     IN  p_CurrencyCode     NVARCHAR(10),
     IN  p_TransactionType  NVARCHAR(50),
     IN  p_PaymentGateway   NVARCHAR(50),
     IN  p_CreatedAt        DATETIME,
     IN  p_CompletedAt      DATETIME,
     IN  p_Status           NVARCHAR(50),
     OUT p_NewId            INT
   )
   BEGIN
     INSERT INTO transactions (
       TransactionId, CustomerId, OrderId, InvoiceNumber, Description,
       Amount, CurrencyCode, TransactionType, PaymentGateway,
       CreatedAt, CompletedAt, Status
     ) VALUES (
       p_TransactionId, p_CustomerId, p_OrderId, p_InvoiceNumber, p_Description,
       p_Amount, p_CurrencyCode, p_TransactionType, p_PaymentGateway,
       p_CreatedAt, p_CompletedAt, p_Status
     );
     SET p_NewId = LAST_INSERT_ID();
   END $$

   -- 3) UpdateTransaction - update by Id
   CREATE OR REPLACE PROCEDURE UpdateTransaction(
     IN p_Id               INT,
     IN p_TransactionId    NVARCHAR(50),
     IN p_CustomerId       INT,
     IN p_OrderId          INT,
     IN p_InvoiceNumber    NVARCHAR(50),
     IN p_Description      NVARCHAR(500),
     IN p_Amount           DECIMAL(18,2),
     IN p_CurrencyCode     NVARCHAR(10),
     IN p_TransactionType  NVARCHAR(50),
     IN p_PaymentGateway   NVARCHAR(50),
     IN p_CreatedAt        DATETIME,
     IN p_CompletedAt      DATETIME,
     IN p_Status           NVARCHAR(50)
   )
   BEGIN
     UPDATE transactions SET
       TransactionId = p_TransactionId,
       CustomerId = p_CustomerId,
       OrderId = p_OrderId,
       InvoiceNumber = p_InvoiceNumber,
       Description = p_Description,
       Amount = p_Amount,
       CurrencyCode = p_CurrencyCode,
       TransactionType = p_TransactionType,
       PaymentGateway = p_PaymentGateway,
       CreatedAt = p_CreatedAt,
       CompletedAt = p_CompletedAt,
       Status = p_Status
     WHERE Id = p_Id;
     SELECT ROW_COUNT() AS AffectedRows;
   END $$

   -- 4) DeleteTransaction - delete by Id
   CREATE OR REPLACE PROCEDURE DeleteTransaction(
     IN p_Id INT
   )
   BEGIN
     DELETE FROM transactions WHERE Id = p_Id;
     SELECT ROW_COUNT() AS AffectedRows;
   END $$

   DELIMITER ;
   ```

3. **Setup the ASP.NET Core Server**
   
   Update the connection string in `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "MySqlConn": "Server=localhost;Port=3306;Database=transactiondb;Uid=root;Pwd=<password>;Allow User Variables=true;ConvertZeroDateTime=true;"
     },
     "AllowedHosts": "*"
   }
   ```

4. **Setup the React Client**
   
   Navigate to the client folder and install dependencies:
   ```bash
   cd grid_mysql.client
   npm install
   ```

5. **Run the application**
   
   Start the ASP.NET Core server (from Grid_MySQL.Server folder):
   ```bash
   dotnet run
   ```
   
   In a separate terminal, start the React client (from grid_mysql.client folder):
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to the URL displayed in the React terminal (typically `http://localhost:5173`).

## Configuration

### Connection String

The connection string in `appsettings.json` contains the following components:

| Component | Description | Example |
|-----------|-------------|---------|
| Server | MySQL server address | `localhost` |
| Port | MySQL port number | `3306` |
| Database | Database name | `transactiondb` |
| Uid | MySQL username | `root` |
| Pwd | MySQL password | `<secure-password>` |
| Allow User Variables | Required for stored procedures with OUT parameters | `true` |
| ConvertZeroDateTime | Converts MySQL zero datetime to .NET DateTime.MinValue | `true` |

**Security Note**: For production environments, store sensitive credentials using:
- User secrets for development
- Environment variables for production
- Azure Key Vault or similar secure storage solutions

### Stored Procedures

This application uses stored procedures for all database operations:

| Procedure | Purpose | Parameters |
|-----------|---------|------------|
| `GetTransactions` | Retrieve paged data with search/filter/sort | SearchClause, WhereClause, SortClause, Skip, Take, TotalCount (OUT) |
| `InsertTransaction` | Add new transaction record | All transaction fields, NewId (OUT) |
| `UpdateTransaction` | Update existing transaction | Id + all transaction fields |
| `DeleteTransaction` | Remove transaction record | Id |

**Benefits of Stored Procedures:**
- **Security**: Prevents SQL injection through parameterized queries
- **Performance**: Precompiled execution plans and reduced network traffic
- **Maintainability**: Centralized business logic in database layer
- **Transaction Safety**: Built-in rollback capabilities for complex operations

## Project Layout

### Server (Grid_MySQL.Server)

| File/Folder | Purpose |
|-------------|---------|
| `/Models/Transaction.cs` | Data model representing the transactions table with LINQ2DB attributes |
| `/Data/AppDataConnection.cs` | LINQ2DB DataConnection class for database operations and stored procedure calls |
| `/Data/SqlClauseBuilder.cs` | Builds safe SQL clauses from Syncfusion DataManagerRequest |
| `/Controllers/GridController.cs` | API controller handling Grid data operations with UrlAdaptor |
| `/Program.cs` | Service registration, CORS configuration, and LINQ2DB setup |
| `/appsettings.json` | Application configuration including MySQL connection string |

### Client (grid_mysql.client)

| File/Folder | Purpose |
|-------------|---------|
| `/src/App.tsx` | React Grid component with UrlAdaptor, toolbar, and data operations |
| `/src/index.css` | Syncfusion theme imports and styling |
| `/package.json` | React dependencies and npm scripts |
| `/vite.config.ts` | Vite build configuration |

## Common Tasks

### Add a Transaction
1. Click the **Add** button in the toolbar
2. Fill in the form fields (TransactionId, CustomerId, Amount, etc.)
3. Click **Update** to persist the record to the database via `InsertTransaction` stored procedure

### Edit a Transaction
1. Select a row in the grid
2. Click the **Edit** button in the toolbar
3. Modify the required fields
4. Click **Update** to save changes via `UpdateTransaction` stored procedure

### Delete a Transaction
1. Select a row in the grid
2. Click the **Delete** button in the toolbar
3. Confirm the deletion in the dialog (calls `DeleteTransaction` stored procedure)

### Search Records
1. Use the **Search** box in the toolbar
2. Enter keywords to filter records (searches across all columns)
3. Server builds safe SQL LIKE clauses for the search

### Filter Records
1. Click the filter icon in any column header
2. Select filter criteria (equals, contains, greater than, etc.)
3. Click **Filter** to apply
4. Server converts filter criteria to SQL WHERE clauses

### Sort Records
1. Click the column header to sort ascending
2. Click again to sort descending
3. Server builds SQL ORDER BY clauses for sorting

### Paging
- Use the page navigation controls at the bottom of the grid
- Server-side paging retrieves only the requested page from database
- Configured via `allowPaging` property and `pageSettings`

## Troubleshooting

### Connection Error
- Verify MySQL Server is running on the specified host and port
- Confirm the database name, username, and password are correct
- Ensure the `transactiondb` database exists
- Check that `Allow User Variables=true` is in the connection string (required for stored procedures)

### Missing Stored Procedures
- Verify all stored procedures were created successfully
- Run `SHOW PROCEDURE STATUS WHERE Db='transactiondb';` in MySQL to check
- Re-run the stored procedure creation script if needed
- Check MySQL user has EXECUTE privileges on stored procedures

### CORS Issues
- Ensure the ASP.NET Core server CORS policy allows the React client origin
- Check the browser console for CORS-related errors
- Verify `app.UseCors("cors")` is called before `app.MapControllers()` in Program.cs

### Grid Not Loading Data
- Check the browser network tab for failed API requests
- Verify the server is running on the expected port
- Ensure the `url` in DataManager points to the correct server endpoint
- Check server console for exceptions during stored procedure execution

### LINQ2DB Configuration Issues
- Verify `linq2db`, `linq2db.MySql`, and `MySqlConnector` packages are installed
- Ensure `UseMySql()` is called with correct MySQL version (MySql80 or MySql57)
- Check that `MySqlProvider.MySqlConnector` is specified (not MySqlData)

### React Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Ensure all Syncfusion packages are at compatible versions
- Check that CSS imports in `index.css` match your installed package versions

### Stored Procedure Parameter Errors
- Verify parameter names match between stored procedures and C# code
- Check that `Allow User Variables=true` is in connection string for OUT parameters
- Ensure parameter types match between database and model definitions

## Architecture Notes

### Why Stored Procedures?
This sample uses stored procedures instead of direct SQL or ORM queries for several reasons:
- **Security**: Protection against SQL injection attacks
- **Performance**: Precompiled execution plans
- **Maintainability**: Business logic centralized in database
- **Control**: Fine-grained control over query optimization

### LINQ2DB vs Entity Framework Core
LINQ2DB is used in this sample for:
- Better performance with stored procedures
- Lighter weight compared to EF Core
- More direct control over SQL execution
- Simpler configuration for MySQL stored procedures

### Server-Side Operations
All data operations (filtering, sorting, searching, paging) are performed on the MySQL server:
- Reduces data transfer between server and client
- Improves performance for large datasets
- Centralizes business logic validation
- Enhances security through controlled data access

## Full Documentation

Detailed, step-by-step directions are available in the [user guide]().