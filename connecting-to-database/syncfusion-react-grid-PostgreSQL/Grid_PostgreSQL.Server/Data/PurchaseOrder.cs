using System.ComponentModel.DataAnnotations;

namespace Grid_PostgreSQL.Server.Data
{
    /// <summary>
    /// Represents a purchase order record mapped to the 'PurchaseOrder' table in the database.
    /// This model defines the structure of purchase order-related data used throughout the application.
    /// </summary>
    public class PurchaseOrder
    {
        /// <summary>
        /// Gets or sets the unique identifier for the purchase order record.
        /// This is the primary key and auto-incremented by the database.
        /// </summary>
        [Key]
        public int PurchaseOrderId { get; set; }

        /// <summary>
        /// Gets or sets the public-facing purchase order number (e.g., PO-2025-0001).
        /// This is a unique identifier visible to users and external systems.
        /// </summary>
        public string? PoNumber { get; set; }

        /// <summary>
        /// Gets or sets the vendor identifier (e.g., VEN-9001).
        /// Links the purchase order to a specific vendor.
        /// </summary>
        public string? VendorID { get; set; }

        /// <summary>
        /// Gets or sets the name or description of the item being ordered.
        /// </summary>
        public string? ItemName { get; set; }

        /// <summary>
        /// Gets or sets the category of the item (e.g., Electronics, Office Supplies, Hardware).
        /// </summary>
        public string? ItemCategory { get; set; }

        /// <summary>
        /// Gets or sets the quantity of items being ordered.
        /// Must be a positive integer.
        /// </summary>
        public int Quantity { get; set; }

        /// <summary>
        /// Gets or sets the unit price of each item (e.g., 899.99).
        /// Stored with precision of 12 digits and 2 decimal places.
        /// </summary>
        public decimal UnitPrice { get; set; }

        /// <summary>
        /// Gets or sets the total amount for the order (Quantity × UnitPrice).
        /// Auto-calculated and stored with precision of 14 digits and 2 decimal places.
        /// </summary>
        public decimal? TotalAmount { get; set; }

        /// <summary>
        /// Gets or sets the current status of the purchase order.
        /// Possible values: Pending, Approved, Ordered, Received, Canceled, Completed.
        /// </summary>
        public string? Status { get; set; }

        /// <summary>
        /// Gets or sets the name of the person who created the purchase order.
        /// </summary>
        public string? OrderedBy { get; set; }

        /// <summary>
        /// Gets or sets the name of the person who approved the purchase order.
        /// </summary>
        public string? ApprovedBy { get; set; }

        /// <summary>
        /// Gets or sets the date when the purchase order was placed.
        /// </summary>
        public DateTime OrderDate { get; set; }

        /// <summary>
        /// Gets or sets the expected delivery date for the ordered items.
        /// </summary>
        public DateTime? ExpectedDeliveryDate { get; set; }

        /// <summary>
        /// Gets or sets the timestamp indicating when the purchase order record was created.
        /// Auto-set to the current date and time by the database.
        /// </summary>
        public DateTimeOffset CreatedOn { get; set; }

        /// <summary>
        /// Gets or sets the timestamp indicating when the purchase order record was last updated.
        /// Auto-updated to the current date and time whenever a modification occurs.
        /// </summary>
        public DateTimeOffset UpdatedOn { get; set; }
    }
}