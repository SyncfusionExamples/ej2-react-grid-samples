using Microsoft.AspNetCore.Mvc;
using Syncfusion.EJ2.Base;
using Grid_SQLite.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace Grid_SQLite.Server.Controllers
{
    /// <summary>
    /// API Controller for managing Asset entities
    /// Supports full CRUD operations with Syncfusion Grid UrlAdaptor
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AssetController(AssetDbContext db) : ControllerBase
    {
        private readonly AssetDbContext _db = db;

        /// <summary>
        /// POST: api/asset/url
        /// Primary endpoint for Syncfusion Grid UrlAdaptor
        /// Accepts DataManagerRequest and returns data with optional counts
        /// Handles search, filter, sort, and pagination
        /// </summary>
        [HttpPost("url")]
        public async Task<IActionResult> UrlDatasource([FromBody] DataManagerRequest dm)
        {
            try
            {
                // Get IQueryable<Asset> from DbContext
                IQueryable<Asset> query = _db.Assets.OrderByDescending(a => a.Id);

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

        /// <summary>
        /// POST: api/asset/insert
        /// Inserts a new Asset and returns the created entity with generated Id, AssetID, and SerialNumber
        /// </summary>
        [HttpPost("insert")]
        public async Task<IActionResult> Insert([FromBody] CRUDModel<Asset> model)
        {
            if (model?.Value == null)
                return BadRequest();

            var asset = model.Value;

            // Add to database
            _db.Assets.Add(asset);
            await _db.SaveChangesAsync();

            return Ok(asset);
        }

        /// <summary>
        /// POST: api/asset/update
        /// Updates an existing Asset by Id. The posted body must include the primary key
        /// </summary>
        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] CRUDModel<Asset> model)
        {
            if (model?.Value == null)
                return BadRequest();

            var asset = model.Value;

            // Optional existence check
            if (!_db.Assets.Any(a => a.Id == asset.Id))
                return NotFound();

            _db.Assets.Update(asset);
            await _db.SaveChangesAsync();

            return Ok(asset);
        }

        /// <summary>
        /// POST: api/asset/remove
        /// Removes an Asset by key (Syncfusion UrlAdaptor default posts { key: ... })
        /// </summary>
        [HttpPost("remove")]
        public async Task<IActionResult> Remove([FromBody] CRUDModel<Asset> model)
        {
            // Handle JsonElement to int conversion
            int key;
            if (model.Key is System.Text.Json.JsonElement jsonElement)
            {
                key = jsonElement.GetInt32();
            }
            else
            {
                key = Convert.ToInt32(model.Key);
            }

            var asset = await _db.Assets.FindAsync(key);
            if (asset == null)
                return NotFound("Record not found");

            _db.Assets.Remove(asset);
            await _db.SaveChangesAsync();

            return Ok(new { key });
        }

        /// <summary>
        /// POST: api/asset/batch
        /// Handles batch add, update, and delete in a single transaction
        /// </summary>
        [HttpPost("batch")]
        public async Task<IActionResult> BatchUpdate([FromBody] CRUDModel<Asset> payload)
        {
            if (payload == null)
                return BadRequest("Payload cannot be null");

            using var transaction = await _db.Database.BeginTransactionAsync();

            // INSERT many
            if (payload.Added != null && payload.Added.Count > 0)
            {
                foreach (var asset in payload.Added)
                {
                    _db.Assets.Add(asset);
                    await _db.SaveChangesAsync();
                }
            }

            // UPDATE many
            if (payload.Changed != null && payload.Changed.Count > 0)
            {
                foreach (var asset in payload.Changed)
                {
                    _db.Assets.Update(asset);
                }
                await _db.SaveChangesAsync();
            }

            // DELETE many
            if (payload.Deleted != null && payload.Deleted.Count > 0)
            {
                foreach (var asset in payload.Deleted)
                {
                    // Ensure Id is properly extracted (handle potential JsonElement)
                    int assetId = asset.Id;

                    var existing = await _db.Assets.FindAsync(assetId);
                    if (existing != null)
                    {
                        _db.Assets.Remove(existing);
                    }
                }
                await _db.SaveChangesAsync();
            }

            await transaction.CommitAsync();
            return Ok(payload);
        }
    }
}
