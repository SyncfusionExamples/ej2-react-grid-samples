using System.Linq;
using System.Collections.Generic;
using System.Text.Json;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.GraphQL
{
    public class Query
    {
        // Updated to accept DataManager parameter and return proper format for Syncfusion
        public OrdersReturnType GetOrders(DataManagerInput? datamanager)
        {
            var allOrders = OrdersDetails.GetAllRecords();
            var query = allOrders.AsQueryable();

            // Apply filtering if provided
            if (!string.IsNullOrEmpty(datamanager?.Where))
            {
                query = ApplyFiltering(query, datamanager.Where);
            }

            // Apply searching if provided
            if (!string.IsNullOrEmpty(datamanager?.Search))
            {
                query = ApplySearching(query, datamanager.Search);
            }

            // Get total count after filtering but before paging
            var totalCount = query.Count();

            // Apply sorting if provided
            if (datamanager?.Sorted != null && datamanager.Sorted.Count > 0)
            {
                query = ApplySorting(query, datamanager.Sorted);
            }

            // Apply paging if provided
            if (datamanager?.Skip.HasValue == true)
            {
                query = query.Skip(datamanager.Skip.Value);
            }

            if (datamanager?.Take.HasValue == true)
            {
                query = query.Take(datamanager.Take.Value);
            }

            return new OrdersReturnType
            {
                Result = query.ToList(),
                Count = totalCount
            };
        }

        public OrdersDetails? GetOrder(int orderID) => OrdersDetails.GetAllRecords().FirstOrDefault(o => o.OrderID == orderID);

        // Helper method to apply sorting
        private IQueryable<OrdersDetails> ApplySorting(IQueryable<OrdersDetails> query, List<SortInput> sortList)
        {
            IOrderedQueryable<OrdersDetails>? orderedQuery = null;

            foreach (var (sort, index) in sortList.Select((s, i) => (s, i)))
            {
                var fieldName = sort.Name?.ToLower();
                var isDesc = sort.Direction?.ToLower() == "descending";
                if (string.IsNullOrEmpty(fieldName)) continue;

                var sortFunc = (fieldName, isDesc) switch
                {
                    ("orderid", false) => index == 0 ? query.OrderBy(o => o.OrderID) : orderedQuery?.ThenBy(o => o.OrderID),
                    ("orderid", true) => index == 0 ? query.OrderByDescending(o => o.OrderID) : orderedQuery?.ThenByDescending(o => o.OrderID),
                    ("customerid", false) => index == 0 ? query.OrderBy(o => o.CustomerID) : orderedQuery?.ThenBy(o => o.CustomerID),
                    ("customerid", true) => index == 0 ? query.OrderByDescending(o => o.CustomerID) : orderedQuery?.ThenByDescending(o => o.CustomerID),
                    ("employeeid", false) => index == 0 ? query.OrderBy(o => o.EmployeeID) : orderedQuery?.ThenBy(o => o.EmployeeID),
                    ("employeeid", true) => index == 0 ? query.OrderByDescending(o => o.EmployeeID) : orderedQuery?.ThenByDescending(o => o.EmployeeID),
                    ("shipcountry", false) => index == 0 ? query.OrderBy(o => o.ShipCountry) : orderedQuery?.ThenBy(o => o.ShipCountry),
                    ("shipcountry", true) => index == 0 ? query.OrderByDescending(o => o.ShipCountry) : orderedQuery?.ThenByDescending(o => o.ShipCountry),
                    _ => index == 0 ? query.OrderBy(o => o.OrderID) : orderedQuery
                };

                orderedQuery = sortFunc;
            }

            return orderedQuery ?? query;
        }

        // Helper method to apply filtering
        private IQueryable<OrdersDetails> ApplyFiltering(IQueryable<OrdersDetails> query, string whereClause)
        {
            try
            {
                // Parse the where clause JSON with case-insensitive property matching
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var filters = JsonSerializer.Deserialize<List<FilterCondition>>(whereClause, options);
                if (filters == null || filters.Count == 0) return query;

                foreach (var filter in filters)
                {
                    // Handle predicates (nested filters)
                    if (filter.Predicates != null && filter.Predicates.Count > 0)
                    {
                        // Apply all predicates
                        foreach (var predicate in filter.Predicates)
                        {
                            query = ApplyFilterCondition(query, predicate);
                        }
                    }
                    else
                    {
                        query = ApplyFilterCondition(query, filter);
                    }
                }
            }
            catch (Exception ex)
            {
                // Log exception if needed - for now, just return original query
                System.Diagnostics.Debug.WriteLine($"Filter error: {ex.Message}");
            }

            return query;
        }

        // Helper method to apply individual filter condition
        private IQueryable<OrdersDetails> ApplyFilterCondition(IQueryable<OrdersDetails> query, FilterCondition condition)
        {
            var field = condition.Field?.ToLower();
            var op = condition.Operator?.ToLower();
            var value = condition.Value?.ToString() ?? "";

            if (string.IsNullOrEmpty(field) || string.IsNullOrEmpty(op) || string.IsNullOrEmpty(value)) return query;

            switch (field)
            {
                case "orderid":
                    if (int.TryParse(value, out int orderId))
                    {
                        query = op switch
                        {
                            "equal" => query.Where(o => o.OrderID == orderId),
                            "notequal" => query.Where(o => o.OrderID != orderId),
                            "greaterthan" => query.Where(o => o.OrderID > orderId),
                            "lessthan" => query.Where(o => o.OrderID < orderId),
                            "greaterthanorequal" => query.Where(o => o.OrderID >= orderId),
                            "lessthanorequal" => query.Where(o => o.OrderID <= orderId),
                            _ => query
                        };
                    }
                    break;

                case "customerid":
                    query = op switch
                    {
                        "equal" => query.Where(o => o.CustomerID == value),
                        "notequal" => query.Where(o => o.CustomerID != value),
                        "startswith" => query.Where(o => o.CustomerID != null && o.CustomerID.StartsWith(value)),
                        "endswith" => query.Where(o => o.CustomerID != null && o.CustomerID.EndsWith(value)),
                        "contains" => query.Where(o => o.CustomerID != null && o.CustomerID.Contains(value)),
                        _ => query
                    };
                    break;

                case "employeeid":
                    if (int.TryParse(value, out int empId))
                    {
                        query = op switch
                        {
                            "equal" => query.Where(o => o.EmployeeID == empId),
                            "notequal" => query.Where(o => o.EmployeeID != empId),
                            "greaterthan" => query.Where(o => o.EmployeeID > empId),
                            "lessthan" => query.Where(o => o.EmployeeID < empId),
                            "greaterthanorequal" => query.Where(o => o.EmployeeID >= empId),
                            "lessthanorequal" => query.Where(o => o.EmployeeID <= empId),
                            _ => query
                        };
                    }
                    break;

                case "shipcountry":
                    query = op switch
                    {
                        "equal" => query.Where(o => o.ShipCountry == value),
                        "notequal" => query.Where(o => o.ShipCountry != value),
                        "startswith" => query.Where(o => o.ShipCountry != null && o.ShipCountry.StartsWith(value)),
                        "endswith" => query.Where(o => o.ShipCountry != null && o.ShipCountry.EndsWith(value)),
                        "contains" => query.Where(o => o.ShipCountry != null && o.ShipCountry.Contains(value)),
                        _ => query
                    };
                    break;
            }

            return query;
        }

        // Helper method to apply searching
        private IQueryable<OrdersDetails> ApplySearching(IQueryable<OrdersDetails> query, string searchClause)
        {
            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var searches = JsonSerializer.Deserialize<List<SearchCondition>>(searchClause, options);
                if (searches == null || searches.Count == 0) return query;

                var search = searches[0];
                var key = search.Key?.ToLower();

                if (!string.IsNullOrEmpty(key))
                {
                    query = query.Where(o =>
                        (o.OrderID.HasValue && o.OrderID.Value.ToString().Contains(key)) ||
                        (o.CustomerID != null && o.CustomerID.ToLower().Contains(key)) ||
                        (o.EmployeeID.HasValue && o.EmployeeID.Value.ToString().Contains(key)) ||
                        (o.ShipCountry != null && o.ShipCountry.ToLower().Contains(key))
                    );
                }
            }
            catch
            {
                // If parsing fails, return original query
            }

            return query;
        }
    }

    // Helper classes for parsing filter conditions
    public class FilterCondition
    {
        public string? Field { get; set; }
        public string? Operator { get; set; }
        public object? Value { get; set; }
        public List<FilterCondition>? Predicates { get; set; }
    }

    public class SearchCondition
    {
        public List<string>? Fields { get; set; }
        public string? Key { get; set; }
        public string? Operator { get; set; }
    }
}
