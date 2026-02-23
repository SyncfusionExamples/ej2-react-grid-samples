// File: Data/TicketsDbContext.cs
using Grid_EntityFramework.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Grid_EntityFramework.Server.Data
{
    public class TicketsDbContext(DbContextOptions<TicketsDbContext> options) : DbContext(options)
    {
        public DbSet<Ticket> Tickets => Set<Ticket>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            var entity = modelBuilder.Entity<Ticket>();

            // Table and Schema
            entity.ToTable("Tickets", "dbo");

            // PK
            entity.HasKey(e => e.TicketId);

            // Identity (handled by [DatabaseGenerated] attribute, but we can be explicit)
            entity.Property(e => e.TicketId).ValueGeneratedOnAdd();

            // Column configs (equivalent to your EF6 constraints)
            entity.Property(e => e.PublicTicketId).HasMaxLength(50).IsRequired();
            entity.HasIndex(e => e.PublicTicketId).IsUnique(); // matches your EF6 unique index

            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.Description).HasColumnType("text"); // or nvarchar(max)
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.Department).HasMaxLength(100);
            entity.Property(e => e.Assignee).HasMaxLength(100);
            entity.Property(e => e.CreatedBy).HasMaxLength(100);
            entity.Property(e => e.Status).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Priority).HasMaxLength(50).IsRequired();

            entity.Property(e => e.ResponseDue).HasColumnType("datetime2");
            entity.Property(e => e.DueDate).HasColumnType("datetime2");
            entity.Property(e => e.CreatedAt).HasColumnType("datetime2").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime2").IsRequired();

            base.OnModelCreating(modelBuilder);
        }
    }
}
