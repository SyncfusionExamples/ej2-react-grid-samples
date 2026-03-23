using Microsoft.EntityFrameworkCore;

namespace Grid_PostgreSQL.Server.Data
{
    /// <summary>
    /// DbContext for Purchase Order entity
    /// Manages database connections and entity configurations for the Purchase Order Management System
    /// This context bridges the application with PostgreSQL database
    /// </summary>
    public class PurchaseOrderDbContext : DbContext
    {
        public PurchaseOrderDbContext(DbContextOptions<PurchaseOrderDbContext> options)
            : base(options)
        {
        }

        public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<PurchaseOrder>(entity =>
            {
                // ✅ Use exact table name with correct casing
                entity.ToTable("PurchaseOrder", schema: "public");

                entity.HasKey(e => e.PurchaseOrderId)
                    .HasName("pk_purchaseorder_id");

                entity.Property(e => e.PurchaseOrderId)
                    .ValueGeneratedOnAdd()
                    .HasColumnName("PurchaseOrderId")
                    .HasColumnType("integer");

                entity.Property(e => e.PoNumber)
                    .HasColumnName("PoNumber")
                    .HasColumnType("character varying(30)")
                    .HasMaxLength(30)
                    .IsRequired(true);

                entity.HasIndex(e => e.PoNumber)
                    .IsUnique()
                    .HasDatabaseName("uq_purchaseorder_ponumber");

                entity.Property(e => e.VendorID)
                    .HasColumnName("VendorID")
                    .HasColumnType("character varying(50)")
                    .HasMaxLength(50)
                    .IsRequired(true);

                entity.Property(e => e.ItemName)
                    .HasColumnName("ItemName")
                    .HasColumnType("character varying(200)")
                    .HasMaxLength(200)
                    .IsRequired(true);

                entity.Property(e => e.ItemCategory)
                    .HasColumnName("ItemCategory")
                    .HasColumnType("character varying(100)")
                    .HasMaxLength(100)
                    .IsRequired(false);

                entity.Property(e => e.Quantity)
                    .HasColumnName("Quantity")
                    .HasColumnType("integer")
                    .IsRequired(true);

                entity.Property(e => e.UnitPrice)
                    .HasColumnName("UnitPrice")
                    .HasColumnType("numeric(12,2)")
                    .HasPrecision(12, 2)
                    .IsRequired(true);

                entity.Property(e => e.TotalAmount)
                    .HasColumnName("TotalAmount")
                    .HasColumnType("numeric(14,2)")
                    .HasPrecision(14, 2)
                    .IsRequired(false);

                entity.Property(e => e.Status)
                    .HasColumnName("Status")
                    .HasColumnType("character varying(30)")
                    .HasMaxLength(30)
                    .IsRequired(true)
                    .HasDefaultValue("Pending");

                entity.Property(e => e.OrderedBy)
                    .HasColumnName("OrderedBy")
                    .HasColumnType("character varying(100)")
                    .HasMaxLength(100)
                    .IsRequired(true);

                entity.Property(e => e.ApprovedBy)
                    .HasColumnName("ApprovedBy")
                    .HasColumnType("character varying(100)")
                    .HasMaxLength(100)
                    .IsRequired(false);

                entity.Property(e => e.OrderDate)
                    .HasColumnName("OrderDate")
                    .HasColumnType("date")
                    .IsRequired(true);

                entity.Property(e => e.ExpectedDeliveryDate)
                    .HasColumnName("ExpectedDeliveryDate")
                    .HasColumnType("date")
                    .IsRequired(false);

                entity.Property(e => e.CreatedOn)
                    .HasColumnName("CreatedOn")
                    .HasColumnType("timestamp with time zone")
                    .IsRequired(true)
                    .HasDefaultValueSql("NOW()");

                entity.Property(e => e.UpdatedOn)
                    .HasColumnName("UpdatedOn")
                    .HasColumnType("timestamp with time zone")
                    .IsRequired(true)
                    .HasDefaultValueSql("NOW()");

                entity.HasIndex(e => e.Status)
                    .HasDatabaseName("ix_purchaseorder_status");

                entity.HasIndex(e => e.VendorID)
                    .HasDatabaseName("ix_purchaseorder_vendorid");

                entity.HasIndex(e => e.OrderDate)
                    .HasDatabaseName("ix_purchaseorder_orderdate");

                entity.HasIndex(e => e.OrderedBy)
                    .HasDatabaseName("ix_purchaseorder_orderedby");

                entity.HasIndex(e => e.CreatedOn)
                    .HasDatabaseName("ix_purchaseorder_createdOn");

                entity.HasIndex(e => new { e.Status, e.OrderDate })
                    .HasDatabaseName("ix_purchaseorder_status_orderdate");
            });
        }
    }
}
