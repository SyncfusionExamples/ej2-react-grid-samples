using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using ODataV4Adaptor.Server.Models;

namespace ODataV4Adaptor.Server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        /// <summary>
        /// Retrieves all orders.
        /// </summary>
        /// <returns>The collection of orders.</returns>
        [HttpGet]
        [EnableQuery]
        public IActionResult Get()
        {
            var data = OrdersDetails.GetAllRecords().AsQueryable();
            return Ok(data);
        }

        /// <summary>
        /// Inserts a new order to the collection.
        /// </summary>
        /// <param name="addRecord">The order to be inserted.</param>
        /// <returns>It returns the newly inserted record detail.</returns>
        [HttpPost]
        [EnableQuery]
        public IActionResult Post([FromBody] OrdersDetails addRecord)
        {
            if (addRecord == null)
            {
                return BadRequest("Null order");
            }

            OrdersDetails.GetAllRecords().Insert(0, addRecord);
            return Ok(addRecord);
        }

        /// <summary>
        /// Updates an existing order.
        /// </summary>
        /// <param name="key">The ID of the order to update.</param>
        /// <param name="updatedOrder">The updated order details.</param>
        /// <returns>It returns the updated order details.</returns>
        [HttpPatch("{key}")]
        public IActionResult Patch(int key, [FromBody] OrdersDetails updatedOrder)
        {
            if (updatedOrder == null)
            {
                return BadRequest("No records");
            }
            var existingOrder = OrdersDetails.GetAllRecords().FirstOrDefault(o => o.OrderID == key);
            if (existingOrder != null)
            {
                // If the order exists, update its properties
                existingOrder.CustomerID = updatedOrder.CustomerID ?? existingOrder.CustomerID;
                existingOrder.EmployeeID = updatedOrder.EmployeeID ?? existingOrder.EmployeeID;
                existingOrder.ShipCountry = updatedOrder.ShipCountry ?? existingOrder.ShipCountry;
            }
            return Ok(existingOrder);
        }

        /// <summary>
        /// Deletes an order.
        /// </summary>
        /// <param name="key">The key of the order to be deleted.</param>
        /// <returns>The deleted order.</returns>
        [HttpDelete("{key}")]
        public IActionResult Delete(int key)
        {
            var order = OrdersDetails.GetAllRecords().FirstOrDefault(o => o.OrderID == key);
            if (order != null)
            {
                OrdersDetails.GetAllRecords().Remove(order);
            }
            return Ok(order);
        }
    }
}