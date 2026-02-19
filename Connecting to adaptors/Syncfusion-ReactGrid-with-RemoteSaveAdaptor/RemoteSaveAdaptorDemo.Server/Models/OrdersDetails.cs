using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace RemoteSaveAdaptorDemo.Models
{
    public class OrdersDetails
    {
        // Static in-memory data store (replace with database in production).
        public static List<OrdersDetails> order = new List<OrdersDetails>();

        // Default constructor.
        public OrdersDetails()
        {
        }

        // Parameterized constructor.
        public OrdersDetails(int OrderID, string CustomerId, int EmployeeId, double Freight,
            bool Verified, DateTime OrderDate, string ShipCity, string ShipName,
            string ShipCountry, DateTime ShippedDate, string ShipAddress)
        {
            this.OrderID = OrderID;
            this.CustomerID = CustomerId;
            this.EmployeeID = EmployeeId;
            this.Freight = Freight;
            this.ShipCity = ShipCity;
            this.Verified = Verified;
            this.OrderDate = OrderDate;
            this.ShipName = ShipName;
            this.ShipCountry = ShipCountry;
            this.ShippedDate = ShippedDate;
            this.ShipAddress = ShipAddress;
        }

        /// <summary>
        /// Generates sample order data.
        /// NOTE: For RemoteSaveAdaptor, this returns ALL records at once.
        /// since filtering/paging happens on client-side.
        /// In production, this should fetch from database.
        /// </summary>
        public static List<OrdersDetails> GetAllRecords()
        {
            if (order.Count() == 0)
            {
                int code = 10000;
                // Generate 10,000 sample records (2000 iterations × 5 records).
                // RemoteSaveAdaptor can handle this as it loads all data once.
                for (int i = 1; i <= 2000; i++)
                {
                    order.Add(new OrdersDetails(code + 1, "ALFKI", i + 0, 2.3 * i, false,
                        new DateTime(1991, 05, 15), "Berlin", "Simons bistro", "Denmark",
                        new DateTime(1996, 7, 16), "Kirchgasse 6"));
                    order.Add(new OrdersDetails(code + 2, "ANATR", i + 2, 3.3 * i, true,
                        new DateTime(1990, 04, 04), "Madrid", "Queen Cozinha", "Brazil",
                        new DateTime(1996, 9, 11), "Avda. Azteca 123"));
                    order.Add(new OrdersDetails(code + 3, "ANTON", i + 1, 4.3 * i, true,
                        new DateTime(1957, 11, 30), "Cholchester", "Frankenversand", "Germany",
                        new DateTime(1996, 10, 7), "Carrera 52 con Ave. Bolívar #65-98 Llano Largo"));
                    order.Add(new OrdersDetails(code + 4, "BLONP", i + 3, 5.3 * i, false,
                        new DateTime(1930, 10, 22), "Marseille", "Ernst Handel", "Austria",
                        new DateTime(1996, 12, 30), "Magazinweg 7"));
                    order.Add(new OrdersDetails(code + 5, "BOLID", i + 4, 6.3 * i, true,
                        new DateTime(1953, 02, 18), "Tsawassen", "Hanari Carnes", "Switzerland",
                        new DateTime(1997, 12, 3), "1029 - 12th Ave. S."));
                    code += 5;
                }
            }
            return order;
        }

            // Properties
            [Key]
        public int OrderID { get; set; }

        public string? CustomerID { get; set; }

        public int? EmployeeID { get; set; }

        public double? Freight { get; set; }

        public string? ShipCity { get; set; }

        public bool? Verified { get; set; }

        public DateTime? OrderDate { get; set; }

        public string? ShipName { get; set; }

        public string? ShipCountry { get; set; }

        public DateTime? ShippedDate { get; set; }

        public string? ShipAddress { get; set; }
    }
}