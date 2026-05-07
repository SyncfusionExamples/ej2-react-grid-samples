using Syncfusion.EJ2.Base;

namespace Grid_MySQL.Server.Data
{
    // Builds MySQL-safe SQL clause strings from Syncfusion DataManagerRequest
    public static class SqlClauseBuilder
    {
        //  Allowed column names
        private static readonly HashSet<string> AllowedColumns = new(StringComparer.OrdinalIgnoreCase)
        {
            "Id", "TransactionId", "CustomerId", "OrderId", "InvoiceNumber",
            "Description", "Amount", "CurrencyCode", "TransactionType",
            "PaymentGateway", "CreatedAt", "CompletedAt", "Status"
        };

        // Builds the body of a WHERE clause for searching
        public static string? BuildSearchClause(List<SearchFilter>? searches)
        {
            if (searches == null || searches.Count == 0)
                return null;

            var andBlocks = new List<string>();

            foreach (var s in searches)
            {
                if (string.IsNullOrWhiteSpace(s.Key))
                    continue;
                IEnumerable<string> cols = (s.Fields != null && s.Fields.Count > 0)
                    ? s.Fields.Where(f => AllowedColumns.Contains(f))
                    : AllowedColumns;

                var safeKey = EscapeLike(s.Key);
                var orParts = cols.Select(col => $"`{col}` LIKE '%{safeKey}%'").ToList();

                if (orParts.Count > 0)
                    andBlocks.Add($"({string.Join(" OR ", orParts)})");
            }

            return andBlocks.Count > 0 ? string.Join(" AND ", andBlocks) : null;
        }

        // Builds the body of a WHERE clause for filtering
        public static string? BuildWhereClause(List<WhereFilter>? filters)
        {
            if (filters == null || filters.Count == 0)
                return null;

            var parts = filters
                .Select(BuildSingleFilter)
                .Where(s => s != null)
                .ToList();

            if (parts.Count == 0)
                return null;

            return string.Join(" AND ", parts);
        }


        // Builds the body of an ORDER BY clause from the Syncfusion Sorted list.
        public static string? BuildSortClause(List<Sort>? sorts)
        {
            if (sorts == null || sorts.Count == 0)
                return null;

            var parts = new List<string>();

            foreach (var s in sorts)
            {
                if (!AllowedColumns.Contains(s.Name))
                    continue;

                var dir = string.Equals(s.Direction, "descending", StringComparison.OrdinalIgnoreCase)
                    ? "DESC"
                    : "ASC";

                parts.Add($"`{s.Name}` {dir}");
            }

            return parts.Count > 0 ? string.Join(", ", parts) : null;
        }

        // Recursively converts a single WhereFilter (or a group of nested WhereFilters) into a MySQL expression string.

        private static string? BuildSingleFilter(WhereFilter f)
        {
            // ---- Nested predicate group ----
            if (f.predicates != null && f.predicates.Count > 0)
            {
                var subParts = f.predicates
                    .Select(BuildSingleFilter)
                    .Where(s => s != null)
                    .ToList();

                if (subParts.Count == 0)
                    return null;

                var joiner = string.Equals(f.Condition, "or", StringComparison.OrdinalIgnoreCase)
                    ? " OR "
                    : " AND ";

                return $"({string.Join(joiner, subParts)})";
            }

            // ---- Leaf predicate ----
            if (string.IsNullOrWhiteSpace(f.Field) || !AllowedColumns.Contains(f.Field))
                return null;

            var col = $"`{f.Field}`";
            var op = (f.Operator ?? "equal").ToLowerInvariant();

            // NULL checks
            if (op == "isnull") return $"{col} IS NULL";
            if (op == "isnotnull") return $"{col} IS NOT NULL";
            if (op == "isempty") return $"{col} = ''";
            if (op == "isnotempty") return $"{col} != ''";

            if (f.value == null)
                return null;

            return op switch
            {
                "equal" => $"{col} = {SqlValue(f.Field, f.value)}",
                "notequal" => $"{col} != {SqlValue(f.Field, f.value)}",
                "lessthan" => $"{col} < {SqlValue(f.Field, f.value)}",
                "lessthanorequal" => $"{col} <= {SqlValue(f.Field, f.value)}",
                "greaterthan" => $"{col} > {SqlValue(f.Field, f.value)}",
                "greaterthanorequal" => $"{col} >= {SqlValue(f.Field, f.value)}",
                "contains" => $"{col} LIKE '%{EscapeLike(f.value.ToString()!)}%'",
                "doesnotcontain" => $"{col} NOT LIKE '%{EscapeLike(f.value.ToString()!)}%'",
                "startswith" => $"{col} LIKE '{EscapeLike(f.value.ToString()!)}%'",
                "endswith" => $"{col} LIKE '%{EscapeLike(f.value.ToString()!)}'",
                _ => null
            };
        }

        // Returns a MySQL-literal for the given field value.
        private static string SqlValue(string field, object value)
        {
            // Numeric columns
            if (IsNumericColumn(field))
            {
                if (decimal.TryParse(value.ToString(), System.Globalization.NumberStyles.Any,
                        System.Globalization.CultureInfo.InvariantCulture, out var n))
                    return n.ToString(System.Globalization.CultureInfo.InvariantCulture);
            }

            // DateTime columns
            if (IsDateColumn(field))
            {
                if (DateTime.TryParse(value.ToString(),
                        System.Globalization.CultureInfo.InvariantCulture,
                        System.Globalization.DateTimeStyles.None, out var dt))
                    return $"'{dt:yyyy-MM-dd HH:mm:ss}'";
            }

            // Default: single-quoted string with SQL injection prevention
            return $"'{EscapeString(value.ToString()!)}'";
        }

        private static bool IsNumericColumn(string field) =>
            field is "Id" or "CustomerId" or "OrderId" or "Amount";

        private static bool IsDateColumn(string field) =>
            field is "CreatedAt" or "CompletedAt";

        // Escapes single quotes and backslashes for a MySQL string literal
        private static string EscapeString(string s) =>
            s.Replace("\\", "\\\\").Replace("'", "\\'");

        // Escapes LIKE meta-characters (%, _) plus the usual string escapes
        private static string EscapeLike(string s) =>
            EscapeString(s).Replace("%", "\\%").Replace("_", "\\_");
    }
}
