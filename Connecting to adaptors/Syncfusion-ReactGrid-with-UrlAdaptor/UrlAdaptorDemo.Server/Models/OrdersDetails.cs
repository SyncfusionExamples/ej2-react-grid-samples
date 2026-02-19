using System.ComponentModel.DataAnnotations;

namespace UrlAdaptorDemo.Server.Models
{
    public class OrdersDetails
    {
        // Static in-memory data store (replace with database in production).
        public static List<OrdersDetails> order = new List<OrdersDetails>();

        // Default constructor.
        public OrdersDetails()
        {
        }

        // Parameterized constructor for easy object creation.
        public OrdersDetails(int OrderID, string CustomerId, int EmployeeId, double Freight,
          bool Verified, DateTime OrderDate, string ShipCity, string ShipName,
          string ShipCountry, DateTime ShippedDate, string ShipAddress)
        {
            this.OrderID = OrderID;
            this.CustomerID = CustomerId;
            this.EmployeeID = EmployeeId;
            this.Freight = Freight;
            this.ShipCity = ShipCity;
            this.ShipCountry = ShipCountry;
        }

        /// <summary>
        /// Generates sample order data. In production, replace with database query.
        /// </summary>
        public static List<OrdersDetails> GetAllRecords()
        {
            if (order.Count() == 0)
            {
                int code = 10000;
                for (int i = 1; i < 10; i++)
                {
                    order.Add(new OrdersDetails(code + 1, "ALFKI", i + 0, 2.3 * i, false,
                        new DateTime(1991, 05, 15), "Berlin", "Simons bistro", "Denmark",
                        new DateTime(1996, 7, 16), "Kirchgasse 6"));
                    order.Add(new OrdersDetails(code + 2, "ANATR", i + 2, 3.3 * i, true,
                        new DateTime(1990, 04, 04), "Madrid", "Queen Cozinha", "Brazil",
                        new DateTime(1996, 9, 11), "Avda. Azteca 123"));
                    code += 5;
                }
            }
            return order;
        }

        // Properties with validation attributes.
        [Key]
        public int? OrderID { get; set; }

        public string? CustomerID { get; set; }

        public int? EmployeeID { get; set; }

        public double? Freight { get; set; }

        public string? ShipCity { get; set; }

        public string? ShipCountry { get; set; }

    }
}