using Grid_PostgreSQL.Server.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Syncfusion.EJ2.Base;
using System.Linq;

namespace Grid_PostgreSQL.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseOrderController : ControllerBase
    {
        private readonly PurchaseOrderDbContext _dbContext;

        public PurchaseOrderController(PurchaseOrderDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // READ
        [HttpPost("url")]
        public IActionResult UrlDataSource([FromBody] DataManagerRequest request)
        {
            IQueryable<PurchaseOrder> purchaseOrdersQuery = _dbContext.PurchaseOrders.AsNoTracking();
            var dataOperations = new DataOperations();

            if (request.Search?.Count > 0)
                purchaseOrdersQuery = dataOperations.PerformSearching(purchaseOrdersQuery, request.Search)
                    .Cast<PurchaseOrder>()
                    .AsQueryable();

            if (request.Where?.Count > 0)
                purchaseOrdersQuery = dataOperations.PerformFiltering(purchaseOrdersQuery, request.Where, request.Where[0].Operator)
                    .Cast<PurchaseOrder>()
                    .AsQueryable();

            if (request.Sorted?.Count > 0)
                purchaseOrdersQuery = dataOperations.PerformSorting(purchaseOrdersQuery, request.Sorted)
                    .Cast<PurchaseOrder>()
                    .AsQueryable();
            else
                purchaseOrdersQuery = purchaseOrdersQuery.OrderBy(p => p.PurchaseOrderId);

            var totalCount = purchaseOrdersQuery.Count();

            if (request.Skip > 0)
                purchaseOrdersQuery = purchaseOrdersQuery.Skip(request.Skip);

            if (request.Take > 0)
                purchaseOrdersQuery = purchaseOrdersQuery.Take(request.Take);

            return request.RequiresCounts
                ? Ok(new { result = purchaseOrdersQuery.ToList(), count = totalCount })
                : Ok(purchaseOrdersQuery.ToList());
        }

        // CREATE
        [HttpPost("insert")]
        public IActionResult Insert([FromBody] CRUDModel<PurchaseOrder> crudRequest)
        {
            var purchaseOrder = crudRequest.Value;

            purchaseOrder.PurchaseOrderId = 0;
            purchaseOrder.TotalAmount = purchaseOrder.Quantity * purchaseOrder.UnitPrice;
            purchaseOrder.UpdatedOn = DateTime.UtcNow;

            _dbContext.PurchaseOrders.Add(purchaseOrder);
            _dbContext.SaveChanges();

            return Ok(purchaseOrder);
        }

        // UPDATE
        [HttpPost("update")]
        public IActionResult Update([FromBody] CRUDModel<PurchaseOrder> crudRequest)
        {
            var purchaseOrder = crudRequest.Value;

            purchaseOrder.TotalAmount = purchaseOrder.Quantity * purchaseOrder.UnitPrice;
            purchaseOrder.UpdatedOn = DateTime.UtcNow;

            _dbContext.Entry(purchaseOrder).State = EntityState.Modified;
            _dbContext.SaveChanges();

            return Ok(purchaseOrder);
        }

        // DELETE
        [HttpPost("remove")]
        public IActionResult Remove([FromBody] CRUDModel<PurchaseOrder> crudRequest)
        {
            // Safely parse the key
            var purchaseOrderId = int.Parse(crudRequest.Key.ToString());

            var existingOrder = _dbContext.PurchaseOrders
                .FirstOrDefault(p => p.PurchaseOrderId == purchaseOrderId);

            if (existingOrder != null)
            {
                _dbContext.PurchaseOrders.Remove(existingOrder);
                _dbContext.SaveChanges();
            }

            return Ok(crudRequest);
        }

        // BATCH
        [HttpPost("batch")]
        public IActionResult Batch([FromBody] CRUDModel<PurchaseOrder> crudRequest)
        {
            // Handle updated records
            if (crudRequest.Changed != null)
            {
                foreach (var purchaseOrder in crudRequest.Changed)
                {
                    purchaseOrder.TotalAmount = purchaseOrder.Quantity * purchaseOrder.UnitPrice;
                    purchaseOrder.UpdatedOn = DateTime.UtcNow; // safe with timestamp with time zone
                    _dbContext.PurchaseOrders.Attach(purchaseOrder);
                    _dbContext.Entry(purchaseOrder).State = EntityState.Modified;
                }
            }

            // Handle newly added records
            if (crudRequest.Added != null)
            {
                foreach (var purchaseOrder in crudRequest.Added)
                {
                    purchaseOrder.PurchaseOrderId = 0;
                    purchaseOrder.TotalAmount = purchaseOrder.Quantity * purchaseOrder.UnitPrice;
                    purchaseOrder.UpdatedOn = DateTime.UtcNow;
                    _dbContext.PurchaseOrders.Add(purchaseOrder);
                }
            }

            // Handle deleted records
            if (crudRequest.Deleted != null)
            {
                foreach (var deletedItem in crudRequest.Deleted)
                {
                    // Safely parse the key if it comes as JsonElement
                    var idString = deletedItem.PurchaseOrderId.ToString();
                    if (int.TryParse(idString, out var purchaseOrderId))
                    {
                        var existingOrder = _dbContext.PurchaseOrders.Find(purchaseOrderId);
                        if (existingOrder != null)
                        {
                            _dbContext.PurchaseOrders.Remove(existingOrder);
                        }
                    }
                }
            }

            _dbContext.SaveChanges();
            return Ok(crudRequest);
        }
    }
}
