using LinqToDB.Mapping;

namespace Grid_MySQL.Server.Models
{
    [Table("transactions")]
    public class Transaction
    {
        [PrimaryKey, Identity]
        public int? Id { get; set; }

        [Column, NotNull]
        public string TransactionId { get; set; }

        [Column, NotNull]
        public int CustomerId { get; set; }

        [Column]
        public int? OrderId { get; set; }

        [Column]
        public string InvoiceNumber { get; set; }

        [Column]
        public string Description { get; set; }

        [Column, NotNull]
        public decimal Amount { get; set; }

        [Column]
        public string CurrencyCode { get; set; }

        [Column]
        public string TransactionType { get; set; }

        [Column]
        public string PaymentGateway { get; set; }

        [Column, NotNull]
        public DateTime CreatedAt { get; set; }

        [Column]
        public DateTime? CompletedAt { get; set; }

        [Column]
        public string Status { get; set; }
    }
}
