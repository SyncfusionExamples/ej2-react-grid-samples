using Grid_MySQL.Server.Models;
using LinqToDB;
using LinqToDB.Data;
using LinqToDB.DataProvider.MySql;

namespace Grid_MySQL.Server.Data
{
    // Holds the paged rows and the total matching count returned by sp_GetTransactions 
    public sealed class PagedResult
    {
        public List<Transaction> Rows { get; init; } = [];
        public int TotalCount { get; init; }
    }

    public sealed class AppDataConnection : DataConnection
    {
        public AppDataConnection(IConfiguration config)
            : base(
                new DataOptions().UseMySql(
                    config.GetConnectionString("MySqlConn")!,
                    MySqlVersion.MySql80,
                    MySqlProvider.MySqlConnector
                )
            )
        {
            InlineParameters = true;
        }

        // Direct table access 
        public ITable<Transaction> Transactions => this.GetTable<Transaction>();

        // ------------------------------------------------------------------
        // Stored-procedure helpers
        // ------------------------------------------------------------------

        // Calls sp_GetTransactions with all data-action parameters so that sorting, filtering, 
        // searching, and paging are executed entirely inside MySQL.

        public async Task<PagedResult> SpGetTransactionsAsync(
            string? searchClause,
            string? whereClause,
            string? sortClause,
            int skip,
            int take)
        {
            // OUT parameter – MySQL writes the total count into it.
            var outCount = new DataParameter("p_TotalCount", null, LinqToDB.DataType.Int32)
            {
                Direction = System.Data.ParameterDirection.Output
            };

            // sp_GetTransactions returns one result set (the paged rows) and
            // sets the OUT parameter p_TotalCount.
            var rows = await this.QueryProcAsync<Transaction>(
                "sp_GetTransactions",
                new DataParameter("p_SearchClause", searchClause ?? string.Empty, LinqToDB.DataType.NVarChar),
                new DataParameter("p_WhereClause", whereClause ?? string.Empty, LinqToDB.DataType.NVarChar),
                new DataParameter("p_SortClause", sortClause ?? string.Empty, LinqToDB.DataType.NVarChar),
                new DataParameter("p_Skip", skip, LinqToDB.DataType.Int32),
                new DataParameter("p_Take", take, LinqToDB.DataType.Int32),
                outCount
            );

            return new PagedResult
            {
                Rows = rows.ToList(),
                TotalCount = Convert.ToInt32(outCount.Value)
            };
        }


        // Calls sp_InsertTransaction, captures the OUT parameter p_NewId, and returns the newly generated auto-increment Id.
        public async Task<int> SpInsertTransactionAsync(Transaction t)
        {
            // The OUT parameter must be declared as a DataParameter with
            // Direction = Output so LinqToDB reads back the value MySQL sets.
            var outId = new DataParameter("p_NewId", null, LinqToDB.DataType.Int32)
            {
                Direction = System.Data.ParameterDirection.Output
            };

            await this.ExecuteProcAsync(
                "sp_InsertTransaction",
                new DataParameter("p_TransactionId", t.TransactionId, LinqToDB.DataType.NVarChar),
                new DataParameter("p_CustomerId", t.CustomerId, LinqToDB.DataType.Int32),
                new DataParameter("p_OrderId", t.OrderId, LinqToDB.DataType.Int32),
                new DataParameter("p_InvoiceNumber", t.InvoiceNumber, LinqToDB.DataType.NVarChar),
                new DataParameter("p_Description", t.Description, LinqToDB.DataType.NVarChar),
                new DataParameter("p_Amount", t.Amount, LinqToDB.DataType.Decimal),
                new DataParameter("p_CurrencyCode", t.CurrencyCode, LinqToDB.DataType.NVarChar),
                new DataParameter("p_TransactionType", t.TransactionType, LinqToDB.DataType.NVarChar),
                new DataParameter("p_PaymentGateway", t.PaymentGateway, LinqToDB.DataType.NVarChar),
                new DataParameter("p_CreatedAt", t.CreatedAt, LinqToDB.DataType.DateTime),
                new DataParameter("p_CompletedAt", t.CompletedAt, LinqToDB.DataType.DateTime),
                new DataParameter("p_Status", t.Status, LinqToDB.DataType.NVarChar),
                outId
            );

            return Convert.ToInt32(outId.Value);
        }


        // Calls sp_UpdateTransaction for the given transaction row. Returns the number of rows affected (0 = not found, 1 = updated).
        public async Task<int> SpUpdateTransactionAsync(Transaction t)
        {
            // sp_UpdateTransaction returns a single-row result set containing
            // AffectedRows.  Use QueryProcAsync to read that result set.
            var rows = await this.QueryProcAsync<AffectedRowsResult>(
                "sp_UpdateTransaction",
                new DataParameter("p_Id", t.Id, LinqToDB.DataType.Int32),
                new DataParameter("p_TransactionId", t.TransactionId, LinqToDB.DataType.NVarChar),
                new DataParameter("p_CustomerId", t.CustomerId, LinqToDB.DataType.Int32),
                new DataParameter("p_OrderId", t.OrderId, LinqToDB.DataType.Int32),
                new DataParameter("p_InvoiceNumber", t.InvoiceNumber, LinqToDB.DataType.NVarChar),
                new DataParameter("p_Description", t.Description, LinqToDB.DataType.NVarChar),
                new DataParameter("p_Amount", t.Amount, LinqToDB.DataType.Decimal),
                new DataParameter("p_CurrencyCode", t.CurrencyCode, LinqToDB.DataType.NVarChar),
                new DataParameter("p_TransactionType", t.TransactionType, LinqToDB.DataType.NVarChar),
                new DataParameter("p_PaymentGateway", t.PaymentGateway, LinqToDB.DataType.NVarChar),
                new DataParameter("p_CreatedAt", t.CreatedAt, LinqToDB.DataType.DateTime),
                new DataParameter("p_CompletedAt", t.CompletedAt, LinqToDB.DataType.DateTime),
                new DataParameter("p_Status", t.Status, LinqToDB.DataType.NVarChar)
            );

            return rows.FirstOrDefault()?.AffectedRows ?? 0;
        }


        // Calls sp_DeleteTransaction for the given primary key. Returns the number of rows deleted (0 = not found, 1 = deleted).
        public async Task<int> SpDeleteTransactionAsync(int id)
        {
            var rows = await this.QueryProcAsync<AffectedRowsResult>(
                "sp_DeleteTransaction",
                new DataParameter("p_Id", id, LinqToDB.DataType.Int32)
            );

            return rows.FirstOrDefault()?.AffectedRows ?? 0;
        }
    }

    // Small DTO used to map the AffectedRows result-set column that
    // sp_UpdateTransaction and sp_DeleteTransaction return.
    internal sealed class AffectedRowsResult
    {
        public int AffectedRows { get; set; }
    }
}
