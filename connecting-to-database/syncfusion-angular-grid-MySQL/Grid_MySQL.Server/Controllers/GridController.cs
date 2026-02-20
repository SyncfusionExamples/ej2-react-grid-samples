// File: Grid_MySQL.Server/Controllers/GridController.cs
using Grid_MySQL.Server.Data;
using Grid_MySQL.Server.Models;
using LinqToDB;
using LinqToDB.Async;
using Microsoft.AspNetCore.Mvc;
using Syncfusion.EJ2.Base;

namespace Grid_MySQL.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GridController(AppDataConnection db) : ControllerBase
    {
        private readonly AppDataConnection _db = db;

        // POST: /api/grid/url
        // Accepts Syncfusion DataManagerRequest and returns data with optional counts.
        [HttpPost("url")]
        public async Task<IActionResult> UrlDatasource([FromBody] DataManagerRequest dm)
        {
            try
            {
                // Get IQueryable<Transaction> using LinqToDB raw SQL (to match your original pattern)
                IQueryable<Transaction> query = _db.FromSql<Transaction>(
                    "SELECT * FROM transactiondb.transactions"
                );

                var operation = new QueryableOperation();

                // Searching
                if (dm.Search != null && dm.Search.Count > 0)
                    query = operation.PerformSearching(query, dm.Search);

                // Filtering
                if (dm.Where != null && dm.Where.Count > 0)
                    query = operation.PerformFiltering(query, dm.Where, dm.Where[0].Operator);

                // Sorting
                if (dm.Sorted != null && dm.Sorted.Count > 0)
                    query = operation.PerformSorting(query, dm.Sorted);

                // Total count before paging
                int count = await query.CountAsync();

                // Paging
                if (dm.Skip != 0)
                    query = operation.PerformSkip(query, dm.Skip);
                if (dm.Take != 0)
                    query = operation.PerformTake(query, dm.Take);

                var rows = await query.ToListAsync();

                if (dm.RequiresCounts)
                    return Ok(new { result = rows, count });

                return Ok(rows);
            }
            catch (Exception ex)
            {
                return Problem(title: "UrlDatasource error", detail: ex.ToString());
            }
        }

        // POST: /api/grid/insert
        // Inserts a new Transaction and returns the created entity (with generated Id).
        [HttpPost("insert")]
        public async Task<IActionResult> Insert([FromBody] CRUDModel<Transaction> model)
        {
            if (model?.Value == null)
                return BadRequest();

            var value = model.Value;

            var id = await _db.InsertWithInt32IdentityAsync(value);
            value.Id = id;

            return Ok(value);
        }

        // POST: /api/grid/update
        // Updates an existing Transaction by Id. The posted body must include the primary key.
        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] CRUDModel<Transaction> model)
        {
            if (model?.Value == null)
                return BadRequest();

            var value = model.Value;

            // optional existence check (safe and simple)
            if (!_db.Transactions.Any(t => t.Id == value.Id))
                return NotFound();

            await _db.UpdateAsync(value);
            return Ok(value);
        }

        // POST: /api/grid/remove
        // Removes a Transaction by key (Syncfusion UrlAdaptor default posts { key: ... }).
        [HttpPost("remove")]
        public async Task<IActionResult> Remove([FromBody] CRUDModel<Transaction> model)
        {
            var key = Convert.ToInt32(model.Key);
            var rows = await _db.Transactions.DeleteAsync(t => t.Id == key);
            if (rows == 0)
                return NotFound("Record not found");

            return Ok(new { key });
        }

        // POST: /api/grid/batch
        // Handles batch add, update, and delete in a single transaction.
        [HttpPost("batch")]
        public async Task<IActionResult> BatchUpdate([FromBody] CRUDModel<Transaction> payload)
        {
            using var tr = await _db.BeginTransactionAsync();

            // INSERT many
            if (payload.Added != null && payload.Added.Count > 0)
            {
                foreach (var r in payload.Added)
                {
                    if (r.CreatedAt == default)
                        r.CreatedAt = DateTime.UtcNow;

                    var newId = await _db.InsertWithInt32IdentityAsync(r);
                    r.Id = newId; // return generated key to client
                }
            }

            // UPDATE many
            if (payload.Changed != null && payload.Changed.Count > 0)
            {
                foreach (var r in payload.Changed)
                {
                    await _db
                        .Transactions.Where(t => t.Id == r.Id)
                        .Set(t => t.TransactionId, r.TransactionId)
                        .Set(t => t.CustomerId, r.CustomerId)
                        .Set(t => t.OrderId, r.OrderId)
                        .Set(t => t.InvoiceNumber, r.InvoiceNumber)
                        .Set(t => t.Description, r.Description)
                        .Set(t => t.Amount, r.Amount)
                        .Set(t => t.CurrencyCode, r.CurrencyCode)
                        .Set(t => t.TransactionType, r.TransactionType)
                        .Set(t => t.PaymentGateway, r.PaymentGateway)
                        .Set(t => t.CreatedAt, r.CreatedAt) // keep if you intentionally allow updating CreatedAt
                        .Set(t => t.CompletedAt, r.CompletedAt)
                        .Set(t => t.Status, r.Status)
                        .UpdateAsync();
                }
            }

            // DELETE many
            if (payload.Deleted != null && payload.Deleted.Count > 0)
            {
                var keys = payload.Deleted.Select(d => d.Id).ToArray();
                await _db.Transactions.Where(t => keys.Contains(t.Id)).DeleteAsync();
            }

            await tr.CommitAsync();
            return Ok(payload);
        }
    }
}
