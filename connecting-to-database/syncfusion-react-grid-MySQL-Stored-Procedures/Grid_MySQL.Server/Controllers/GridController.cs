using Grid_MySQL.Server.Data;
using Grid_MySQL.Server.Models;
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
        // All data actions (search, filter, multi-column sort, paging) are delegated to sp_GetTransactions via pre-built MySQL clause strings.
        [HttpPost("url")]
        public async Task<IActionResult> UrlDatasource([FromBody] DataManagerRequest dm)
        {
            // Translate Syncfusion DataManagerRequest into MySQL clause strings using SqlClauseBuilder.

            var searchClause = SqlClauseBuilder.BuildSearchClause(dm.Search);
            var whereClause = SqlClauseBuilder.BuildWhereClause(dm.Where);
            var sortClause = SqlClauseBuilder.BuildSortClause(dm.Sorted);

            // Call the stored procedure.
            var result = await _db.SpGetTransactionsAsync(
                searchClause: searchClause,
                whereClause: whereClause,
                sortClause: sortClause,
                skip: dm.Skip,
                take: dm.Take
            );

            // Return the response
            if (dm.RequiresCounts)
                return Ok(new { result = result.Rows, count = result.TotalCount });

            return Ok(result.Rows);
        }

        // POST: /api/grid/insert
        // Delegates to sp_InsertTransaction and returns the new row with its generated Id.
        [HttpPost("insert")]
        public async Task<IActionResult> Insert([FromBody] CRUDModel<Transaction> model)
        {
            if (model?.Value == null)
                return BadRequest();

            var value = model.Value;

            // Ensure CreatedAt is set before insert.
            if (value.CreatedAt == default)
                value.CreatedAt = DateTime.UtcNow;

            // Call stored procedure; it sets the OUT param and returns the new Id.
            var newId = await _db.SpInsertTransactionAsync(value);
            value.Id = newId;

            return Ok(value);
        }

        // POST: /api/grid/update
        // Delegates to sp_UpdateTransaction.  Returns 404 when the row is not found.
        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] CRUDModel<Transaction> model)
        {
            if (model?.Value == null)
                return BadRequest();

            var value = model.Value;

            // Call stored procedure; it returns the number of affected rows.
            var affected = await _db.SpUpdateTransactionAsync(value);
            if (affected == 0)
                return NotFound("Record not found");

            return Ok(value);
        }

        // POST: /api/grid/remove
        // Delegates to sp_DeleteTransaction.  Returns 404 when the row is not found.
        [HttpPost("remove")]
        public async Task<IActionResult> Remove([FromBody] CRUDModel<Transaction> model)
        {
            var key = int.Parse(model.Key.ToString()); ;
            
            // Call stored procedure; it returns the number of affected rows.
            var affected = await _db.SpDeleteTransactionAsync(key);
            if (affected == 0)
                return NotFound("Record not found");

            return Ok(new { key });
        }

        // POST: /api/grid/batch
        // Handles batch add / update / delete in a single DB transaction,
        // each operation routed through the relevant stored procedure.
        [HttpPost("batch")]
        public async Task<IActionResult> BatchUpdate([FromBody] CRUDModel<Transaction> payload)
        {
            using var tr = await _db.BeginTransactionAsync();

            // INSERT many – sp_InsertTransaction is called once per added row.
            if (payload.Added != null && payload.Added.Count > 0)
            {
                foreach (var r in payload.Added)
                {
                    if (r.CreatedAt == default)
                        r.CreatedAt = DateTime.UtcNow;

                    var newId = await _db.SpInsertTransactionAsync(r);
                    r.Id = newId; // echo generated key back to the client
                }
            }

            // UPDATE many – sp_UpdateTransaction is called once per changed row.
            if (payload.Changed != null && payload.Changed.Count > 0)
            {
                foreach (var r in payload.Changed)
                    await _db.SpUpdateTransactionAsync(r);
            }

            // DELETE many – sp_DeleteTransaction is called once per deleted row.
            if (payload.Deleted != null && payload.Deleted.Count > 0)
            {
                foreach (var r in payload.Deleted)
                    if (r.Id.HasValue)
                        await _db.SpDeleteTransactionAsync(r.Id.Value);
            }

            await tr.CommitAsync();
            return Ok(payload);
        }
    }
}
