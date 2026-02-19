using System.Linq;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.GraphQL
{
    public class OrdersDetailsInput
    {
        public int? OrderID { get; set; }
        public string? CustomerID { get; set; }
        public int? EmployeeID { get; set; }
        public string? ShipCountry { get; set; }
    }

    public class Mutation
    {
        public OrdersDetails AddOrder(OrdersDetailsInput input)
        {
            var newOrder = new OrdersDetails
            {
                OrderID = input.OrderID,
                CustomerID = input.CustomerID,
                EmployeeID = input.EmployeeID,
                ShipCountry = input.ShipCountry
            };
            OrdersDetails.GetAllRecords().Insert(0, newOrder);
            return newOrder;
        }

        public OrdersDetails? UpdateOrder(int key, string? keyColumn, OrdersDetailsInput input)
        {
            // Find the order by the key (OrderID)
            var existing = OrdersDetails.GetAllRecords().FirstOrDefault(o => o.OrderID == key);
            if (existing == null) return null;
            
            // Update only the fields that are provided
            if (input.CustomerID != null)
                existing.CustomerID = input.CustomerID;
            if (input.EmployeeID.HasValue)
                existing.EmployeeID = input.EmployeeID;
            if (input.ShipCountry != null)
                existing.ShipCountry = input.ShipCountry;
            
            return existing;
        }

        public bool DeleteOrder(int orderID)
        {
            var existing = OrdersDetails.GetAllRecords().FirstOrDefault(o => o.OrderID == orderID);
            if (existing == null) return false;
            OrdersDetails.GetAllRecords().Remove(existing);
            return true;
        }
    }
}
