using Microsoft.AspNetCore.Mvc;
using RemoteSaveAdaptorDemo.Models;

namespace RemoteSaveAdaptorDemo.Controllers
{
    
    [ApiController]
    public class OrdersController : ControllerBase
    {
        /// <summary>
        /// GET endpoint - Returns all records.
        /// Optional: Can be used for initial data load.
        /// </summary>
        [HttpGet]
        [Route("api/[controller]")]
        public List<OrdersDetails> GetOrderData()
        {
            // Return ALL records - RemoteSaveAdaptor handles filtering/paging on client.
            return OrdersDetails.GetAllRecords().ToList();
        }

        /// <summary>
        /// POST endpoint - Returns all records with count.
        /// RemoteSaveAdaptor loads ALL data once, then handles.
        /// filtering, sorting, and paging on client-side.
        /// </summary>
        [HttpPost]
        [Route("api/[controller]")]
        public object Post()
        {
            // Retrieve ALL data from data source.
            var DataSource = GetOrderData();

            // Get total records count.
            int totalRecordsCount = DataSource.Count();

            // CRITICAL: Return ALL records (no server-side filtering/paging).
            // Client will handle these operations.
            return new { result = DataSource, count = totalRecordsCount };
        }

        /// <summary>
        /// Inserts a new data item into the data collection.
        /// </summary>
        /// <param name="newRecord">The order to be inserted.</param>
        /// <returns>It returns the newly inserted record detail.</returns>
        [HttpPost]
        [Route("api/Orders/Insert")]
        public ActionResult Insert([FromBody] CRUDModel<OrdersDetails> newRecord)
        {
            if (newRecord.value != null)
            {
                OrdersDetails.GetAllRecords().Insert(0, newRecord.value);
            }

            return new JsonResult(newRecord.value);
        }

        /// <summary>
        /// Updates an existing order.
        /// </summary>
        /// <param name="updateRecord">The updated order details.</param>
        /// <returns>It returns the updated order details.</returns>
        [HttpPost]
        [Route("api/Orders/Update")]
        public object Update([FromBody] CRUDModel<OrdersDetails> updatedRecord)
        {
            var updatedOrder = updatedRecord.value;
            if (updatedOrder != null)
            {
                var data = OrdersDetails.GetAllRecords().FirstOrDefault(or => or.OrderID == updatedOrder.OrderID);
                if (data != null)
                {
                    // Update the existing record.
                    data.OrderID = updatedOrder.OrderID;
                    data.CustomerID = updatedOrder.CustomerID;
                    data.Freight = updatedOrder.Freight;
                    data.ShipCity = updatedOrder.ShipCity;
                    data.ShipCountry = updatedOrder.ShipCountry;
                    data.Verified = updatedOrder.Verified;
                    // Update other properties similarly.
                }
            }
            return updatedRecord;
        }

        /// <summary>
        /// Deletes an order.
        /// </summary>
        /// <param name="deletedRecord">It contains the specific record detail which is need to be removed.</param>
        /// <returns>It returns the deleted record detail.</returns>
        [HttpPost]
        [Route("api/Orders/Remove")]
        public object Remove([FromBody] CRUDModel<OrdersDetails> deletedRecord)
        {
            // Get key value from the deletedRecord.
            int orderId = int.Parse(deletedRecord.key.ToString());
            var data = OrdersDetails.GetAllRecords().FirstOrDefault(orderData => orderData.OrderID == orderId);
            if (data != null)
            {
                // Remove the record from the data collection.
                OrdersDetails.GetAllRecords().Remove(data);
            }
            return deletedRecord;
        }
    }

    public class CRUDModel<T> where T : class
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