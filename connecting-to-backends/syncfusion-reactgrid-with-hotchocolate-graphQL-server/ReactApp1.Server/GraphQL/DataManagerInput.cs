using System.Collections.Generic;

namespace ReactApp1.Server.GraphQL
{
    // Input types for Syncfusion DataManager GraphQL queries
    public class DataManagerInput
    {
        public int? Skip { get; set; }
        public int? Take { get; set; }
        public List<SortInput>? Sorted { get; set; }
        public List<string>? Group { get; set; }
        public string? Table { get; set; }
        public List<string>? Select { get; set; }
        public string? Where { get; set; }
        public string? Search { get; set; }
        public bool? RequiresCounts { get; set; }
        public List<AggregateInput>? Aggregates { get; set; }
        public string? Params { get; set; }
    }

    public class SortInput
    {
        public string? Name { get; set; }
        public string? Direction { get; set; }
    }

    public class AggregateInput
    {
        public string? Field { get; set; }
        public string? Type { get; set; }
    }
}
