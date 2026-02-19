using System.Collections.Generic;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.GraphQL
{
    // Return type for Syncfusion GraphQLAdaptor
    // Must have 'result' and 'count' properties
    public class OrdersReturnType
    {
        public List<OrdersDetails> Result { get; set; } = new List<OrdersDetails>();
        public int Count { get; set; }
        public string? Aggregates { get; set; }
    }
}
