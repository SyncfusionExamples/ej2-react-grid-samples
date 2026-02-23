using System.ComponentModel.DataAnnotations;

namespace Grid_MSSQL.Server.Data
{
    /// <summary>
    /// Represents a ticket record mapped to the 'Tickets' table in the database.
    /// This model defines the structure of ticket-related data used throughout the application.
    /// </summary>
    public class Tickets
    {
        /// <summary>
        /// Gets or sets the unique identifier for the ticket record.
        /// </summary>
        [Key]
        public int TicketId { get; set; }

        /// <summary>
        /// Gets or sets the public-facing ticket identifier (e.g., NET-1001).
        /// </summary>
        public string? PublicTicketId { get; set; }

        /// <summary>
        /// Gets or sets the ticket title or subject.
        /// </summary>
        public string? Title { get; set; }

        /// <summary>
        /// Gets or sets a detailed description of the ticket.
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Gets or sets the category of the issue (e.g., Network, Hardware, Software).
        /// </summary>
        public string? Category { get; set; }

        /// <summary>
        /// Gets or sets the department responsible for handling the ticket.
        /// </summary>
        public string? Department { get; set; }

        /// <summary>
        /// Gets or sets the name of the agent assigned to the ticket.
        /// </summary>
        public string? Assignee { get; set; }

        /// <summary>
        /// Gets or sets the name of the person who created the ticket.
        /// </summary>
        public string? CreatedBy { get; set; }

        /// <summary>
        /// Gets or sets the current status of the ticket (e.g., Open, In Progress, Resolved, Closed).
        /// </summary>
        public string? Status { get; set; }

        /// <summary>
        /// Gets or sets the priority level of the ticket (e.g., Critical, High, Medium, Low).
        /// </summary>
        public string? Priority { get; set; }

        /// <summary>
        /// Gets or sets the deadline for responding to the ticket.
        /// </summary>
        public DateTime? ResponseDue { get; set; }

        /// <summary>
        /// Gets or sets the deadline for resolving the ticket.
        /// </summary>
        public DateTime? DueDate { get; set; }

        /// <summary>
        /// Gets or sets the timestamp indicating when the ticket was created.
        /// </summary>
        public DateTime? CreatedAt { get; set; }

        /// <summary>
        /// Gets or sets the timestamp indicating when the ticket was last updated.
        /// </summary>
        public DateTime? UpdatedAt { get; set; }
    }
}
