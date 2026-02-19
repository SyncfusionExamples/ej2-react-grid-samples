using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WebApiAdaptor.Server.Models;

namespace WebApiAdaptor.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        /// <summary>
        /// Retrieves orders with filtering and searching support.
        /// </summary>
        [HttpGet]
        public object Get()
        {
            var queryString = Request.Query;
            var data = OrdersDetails.GetAllRecords().ToList();
            string filter = queryString["$filter"];

            if (!string.IsNullOrEmpty(filter))
            {
                filter = filter.Trim();

                // Remove outer parentheses
                if (filter.StartsWith("(") && filter.EndsWith(")"))
                {
                    int openCount = filter.Count(c => c == '(');
                    int closeCount = filter.Count(c => c == ')');

                    if (openCount == closeCount && openCount > 0)
                    {
                        filter = filter.Substring(1, filter.Length - 2).Trim();
                    }
                }

                var filters = filter.Split(new string[] { " and " }, StringSplitOptions.RemoveEmptyEntries);

                foreach (var filterItem in filters)
                {
                    if (filterItem.Contains("substringof"))
                    {
                        // Handle SEARCH operation (global search across all columns)
                        var searchParts = filterItem.Split('(', ')', '\'');
                        var searchValue = searchParts[3].ToLower();

                        // Search across all searchable fields
                        data = data.Where(x =>
                            (x.OrderID?.ToString().Contains(searchValue) ?? false) ||
                            (x.CustomerID?.ToLower().Contains(searchValue) ?? false) ||
                            (x.ShipCountry?.ToLower().Contains(searchValue) ?? false) ||
                            (x.ShipCity?.ToLower().Contains(searchValue) ?? false) ||
                            (x.ShipName?.ToLower().Contains(searchValue) ?? false)
                        ).ToList();
                    }
                    else
                    {
                        // Handle FILTER operation (column-specific filtering)
                        var filterfield = "";
                        var filtervalue = "";
                        var filterParts = filterItem.Split('(', ')', '\'');

                        if (filterParts.Length != 9)
                        {
                            var filterValueParts = filterParts[1].Split();
                            filterfield = filterValueParts[0];
                            filtervalue = filterValueParts[2];
                        }
                        else
                        {
                            filterfield = filterParts[3];
                            filtervalue = filterParts[5];
                        }

                        switch (filterfield)
                        {
                            case "OrderID":
                                data = data.Where(x => x.OrderID.ToString() == filtervalue).ToList();
                                break;
                            case "CustomerID":
                                data = data.Where(x => x.CustomerID.ToLower().Contains(filtervalue.ToLower())).ToList();
                                break;
                            case "ShipCity":
                                data = data.Where(x => x.ShipCity.ToLower().Contains(filtervalue.ToLower())).ToList();
                                break;
                            case "ShipCountry":
                                data = data.Where(x => x.ShipCountry.ToLower().Contains(filtervalue.ToLower())).ToList();
                                break;
                        }
                    }
                }
            }
            string sort = queryString["$orderby"];
            if (!string.IsNullOrEmpty(sort))
            {
                var sortConditions = sort.Split(',');
                var orderedData = data.OrderBy(x => 0); // Start with a stable sort.
                foreach (var sortCondition in sortConditions)
                {
                    var sortParts = sortCondition.Trim().Split(' ');
                    var sortBy = sortParts[0];
                    var sortOrder = sortParts.Length > 1 && sortParts[1].ToLower() == "desc";
                    switch (sortBy)
                    {
                        case "OrderID":
                            orderedData = sortOrder ? orderedData.ThenByDescending(x => x.OrderID) : orderedData.ThenBy(x => x.OrderID);
                            break;
                        case "CustomerID":
                            orderedData = sortOrder ? orderedData.ThenByDescending(x => x.CustomerID) : orderedData.ThenBy(x => x.CustomerID);
                            break;
                        case "ShipCity":
                            orderedData = sortOrder ? orderedData.ThenByDescending(x => x.ShipCity) : orderedData.ThenBy(x => x.ShipCity);
                            break;
                        case "ShipCountry":
                            orderedData = sortOrder ? orderedData.ThenByDescending(x => x.ShipCountry) : orderedData.ThenBy(x => x.ShipCountry);
                            break;
                            // Add more cases for other sort fields if needed.
                    }
                }
                data = orderedData.ToList();
            }
            int skip = Convert.ToInt32(queryString["$skip"]);
            int take = Convert.ToInt32(queryString["$top"]);
            return take != 0 ? new { Items = data.Skip(skip).Take(take).ToList(), Count = data.Count() } : new { Items = data, Count = data.Count() };
        }
        // POST: api/Orders
        [HttpPost]
        /// <summary>
        /// Inserts a new data item into the data collection.
        /// </summary>
        /// <param name="newRecord">It holds new record detail which is need to be inserted.</param>
        /// <returns>Returns void</returns>
        public void Post([FromBody] OrdersDetails newRecord)
        {
            // Insert a new record into the OrdersDetails model.
            OrdersDetails.GetAllRecords().Insert(0, newRecord);
        }
        // PUT: api/Orders
        [HttpPut]
        /// <summary>
        /// Update a existing data item from the data collection.
        /// </summary>
        /// <param name="updatedOrder">It holds updated record detail which is need to be updated.</param>
        /// <returns>Returns void</returns>
        public void Put([FromBody] OrdersDetails updatedOrder)
        {
            // Find the existing order by ID
            var existingOrder = OrdersDetails.GetAllRecords().FirstOrDefault(o => o.OrderID == updatedOrder.OrderID);
            if (existingOrder != null)
            {
                // If the order exists, update its properties.
                existingOrder.OrderID = updatedOrder.OrderID;
                existingOrder.CustomerID = updatedOrder.CustomerID;
                existingOrder.ShipCity = updatedOrder.ShipCity;
                existingOrder.ShipCountry = updatedOrder.ShipCountry;
                // Update other properties similarly.
            }
        }
        // DELETE: api/5
        [HttpDelete("{key}")]
        /// <summary>
        /// Remove a specific data item from the data collection.
        /// </summary>
        /// <param name="key">It holds specific record detail id which is need to be removed.</param>
        /// <returns>Returns void</returns>
        public void Delete(int key)
        {
            // Find the order to remove by ID.
            var orderToRemove = OrdersDetails.GetAllRecords().FirstOrDefault(order => order.OrderID == key);
            // If the order exists, remove it.
            if (orderToRemove != null)
            {
                OrdersDetails.GetAllRecords().Remove(orderToRemove);
            }
        }
    }
}

