using Microsoft.EntityFrameworkCore;
using Domain.Entities;

namespace Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    // db sets
    public DbSet<User> Users { get; set; }



    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        /* --- USER --- */
        // creating the entity entry with its specifications
        // Entities must have "public int Id { get; set; }" as a variable, EF core makes this its PK and auto increments it.
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.PasswordHash)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
    }
}
