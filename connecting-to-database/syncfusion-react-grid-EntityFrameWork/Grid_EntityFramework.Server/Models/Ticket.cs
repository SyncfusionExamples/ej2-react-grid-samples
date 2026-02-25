// File: Models/Ticket.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Grid_EntityFramework.Server.Models
{
    [Table("Tickets", Schema = "dbo")]
    public class Ticket
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TicketId { get; set; }

        [Required, MaxLength(50)]
        public string PublicTicketId { get; set; }

        [MaxLength(200)]
        public string Title { get; set; }

        // EF Core: prefer NVARCHAR(MAX) instead of deprecated TEXT.
        // We'll keep column type from your EF6 note if you must match legacy schema:
        [Column(TypeName = "text")] // Consider changing to nvarchar(max) for modern SQL Server
        public string Description { get; set; }

        [MaxLength(100)]
        public string Category { get; set; }

        [MaxLength(100)]
        public string Department { get; set; }

        [MaxLength(100)]
        public string Assignee { get; set; }

        [MaxLength(100)]
        public string CreatedBy { get; set; }

        [Required, MaxLength(50)]
        public string Status { get; set; } = "Open";

        [Required, MaxLength(50)]
        public string Priority { get; set; } = "Medium";

        [Column(TypeName = "datetime2")]
        public DateTime? ResponseDue { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? DueDate { get; set; }

        [Required, Column(TypeName = "datetime2")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required, Column(TypeName = "datetime2")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
