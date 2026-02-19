using Microsoft.AspNetCore.Mvc;
using Syncfusion.EJ2.Base;
using WebMethodAdaptorDemo.Server.Models;

namespace WebMethodAdaptorDemo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GridController : ControllerBase
    {
        /// <summary>
        /// GET endpoint for retrieving all orders (optional).
        /// </summary>
        [HttpGet]
        public List<OrdersDetails> GetOrderData()
        {
            return OrdersDetails.GetAllRecords().ToList();
        }

        /// <summary>
        /// POST endpoint for handling Grid data requests with WebMethodAdaptor.
        /// CRITICAL: Parameter is wrapped in DataManager class to access 'value' object.
        /// </summary>
        [HttpPost]
        public object Post([FromBody] DataManager DataManagerRequest)
        {
            // Retrieve data from the data source (e.g., database).
            IQueryable<OrdersDetails> DataSource = GetOrderData().AsQueryable();

            // Initialize QueryableOperation instance.
            QueryableOperation queryableOperation = new QueryableOperation();

            // Retrieve data manager value.
            DataManagerRequest DataManagerParams = DataManagerRequest.Value;

            if (DataManagerParams.Where != null && DataManagerParams.Where.Count > 0)
            {
                // Handling filtering operation.
                foreach (var condition in DataManagerParams.Where)
                {
                    foreach (var predicate in condition.predicates)
                    {
                        DataSource = queryableOperation.PerformFiltering(
                            DataSource,
                            DataManagerParams.Where,
                            predicate.Operator
                        );
                    }
                }
            }

            // Handling searching operation.
            if (DataManagerParams.Search != null && DataManagerParams.Search.Count > 0)
            {
                DataSource = queryableOperation.PerformSearching(
                    DataSource,
                    DataManagerParams.Search
                );
            }

            // Handling sorting operation.
            if (DataManagerParams.Sorted != null && DataManagerParams.Sorted.Count > 0)
            {
                DataSource = queryableOperation.PerformSorting(
                    DataSource,
                    DataManagerParams.Sorted
                );
            }

            // Get the total records count.
            int totalRecordsCount = DataSource.Count();

            // Handling paging operation.
            if (DataManagerParams.Skip != 0)
            {
                DataSource = queryableOperation.PerformSkip(DataSource, DataManagerParams.Skip);
            }
            if (DataManagerParams.Take != 0)
            {
                DataSource = queryableOperation.PerformTake(DataSource, DataManagerParams.Take);
            }

            // Return data based on the request.
            return new { result = DataSource, count = totalRecordsCount };
        }

        /// <summary>
        /// Inserts a new data item into the data collection.
        /// </summary>
        /// <param name="newRecord">It contains the new record detail which is need to be inserted.</param>
        /// <returns>Returns void</returns>
        [HttpPost]
        [Route("Insert")]
        public void Insert([FromBody] CRUDModel<OrdersDetails> newRecord)
        {
            // Check if new record is not null.
            if (newRecord.value != null)
            {
                // Insert new record.
                OrdersDetails.GetAllRecords().Insert(0, newRecord.value);
            }
        }

        /// <summary>
        /// Update a existing data item from the data collection.
        /// </summary>
        /// <param name="updatedRecord">It contains the updated record detail which is need to be updated.</param>
        /// <returns>Returns void</returns>
        [HttpPost]
        [Route("Update")]
        public void Update([FromBody] CRUDModel<OrdersDetails> updatedRecord)
        {
            // Retrieve updated order.
            var updatedOrder = updatedRecord.value;
            if (updatedOrder != null)
            {
                // Find existing record.
                var data = OrdersDetails
                    .GetAllRecords()
                    .FirstOrDefault(or => or.OrderID == updatedOrder.OrderID);
                if (data != null)
                {
                    // Update existing record.
                    data.OrderID = updatedOrder.OrderID;
                    data.CustomerID = updatedOrder.CustomerID;
                    data.ShipCity = updatedOrder.ShipCity;
                    data.ShipCountry = updatedOrder.ShipCountry;
                    // Update other properties similarly.
                }
            }
        }

        /// <summary>
        /// Remove a specific data item from the data collection.
        /// </summary>
        /// <param name="deletedRecord">It contains the specific record detail which is need to be removed.</param>
        /// <return>Returns void</return>
        [HttpPost]
        [Route("Remove")]
        public void Remove([FromBody] CRUDModel<OrdersDetails> deletedRecord)
        {
            int orderId = int.Parse(deletedRecord.key.ToString()); // Get key value from the deletedRecord.
            var data = OrdersDetails
                .GetAllRecords()
                .FirstOrDefault(orderData => orderData.OrderID == orderId);
            if (data != null)
            {
                // Remove the record from the data collection.
                OrdersDetails.GetAllRecords().Remove(data);
            }
        }

        [HttpPost]
        [Route("CrudUpdate")]
        public void CrudUpdate([FromBody] CRUDModel<OrdersDetails> request)
        {
            // Perform update operation.
            if (request.action == "update")
            {
                var orderValue = request.value;
                OrdersDetails existingRecord = OrdersDetails
                    .GetAllRecords()
                    .Where(or => or.OrderID == orderValue.OrderID)
                    .FirstOrDefault();
                existingRecord.OrderID = orderValue.OrderID;
                existingRecord.CustomerID = orderValue.CustomerID;
                existingRecord.ShipCity = orderValue.ShipCity;
                existingRecord.ShipCountry = orderValue.ShipCountry;
                // Update other properties similarly.
            }
            // Perform insert operation.
            else if (request.action == "insert")
            {
                OrdersDetails.GetAllRecords().Insert(0, request.value);
            }
            // Perform remove operation.
            else if (request.action == "remove")
            {
                OrdersDetails
                    .GetAllRecords()
                    .Remove(
                        OrdersDetails
                            .GetAllRecords()
                            .Where(or => or.OrderID == int.Parse(request.key.ToString()))
                            .FirstOrDefault()
                    );
            }
        }

        [HttpPost]
        [Route("BatchUpdate")]
        public IActionResult BatchUpdate([FromBody] CRUDModel<OrdersDetails> batchOperation)
        {
            if (batchOperation.added != null)
            {
                foreach (var addedOrder in batchOperation.added)
                {
                    OrdersDetails.GetAllRecords().Insert(0, addedOrder);
                }
            }
            if (batchOperation.changed != null)
            {
                foreach (var changedOrder in batchOperation.changed)
                {
                    var existingOrder = OrdersDetails
                        .GetAllRecords()
                        .FirstOrDefault(or => or.OrderID == changedOrder.OrderID);
                    if (existingOrder != null)
                    {
                        existingOrder.CustomerID = changedOrder.CustomerID;
                        existingOrder.ShipCity = changedOrder.ShipCity;
                        // Update other properties as needed.
                    }
                }
            }
            if (batchOperation.deleted != null)
            {
                foreach (var deletedOrder in batchOperation.deleted)
                {
                    var orderToDelete = OrdersDetails
                        .GetAllRecords()
                        .FirstOrDefault(or => or.OrderID == deletedOrder.OrderID);
                    if (orderToDelete != null)
                    {
                        OrdersDetails.GetAllRecords().Remove(orderToDelete);
                    }
                }
            }
            return Ok(batchOperation);
        }
    }

    /// <summary>
    /// Wrapper class for WebMethodAdaptor requests.
    /// WebMethodAdaptor wraps DataManagerRequest inside a 'value' property.
    /// </summary>
    public class DataManager
    {
        public required DataManagerRequest Value { get; set; }
    }

    public class CRUDModel<T>
        where T : class
    {
        public string? action { get; set; }
        public string? keyColumn { get; set; }
        public object? key { get; set; }
        public T? value { get; set; }
        public List<T>? added { get; set; }
        public List<T>? changed { get; set; }
        public List<T>? deleted { get; set; }
        public IDictionary<string, object>? @params { get; set; }
    }
}
