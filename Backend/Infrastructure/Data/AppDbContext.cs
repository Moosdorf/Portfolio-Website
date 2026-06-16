using Backend.Domain.Entities.Chess.Games;
using Backend.Domain.Entities.Project;
using Backend.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    // db sets
    public DbSet<User> Users { get; set; }

    // cheess
    public DbSet<ChessGame> ChessGames { get; set; }

    // projects
    public DbSet<Project> Projects { get; set; }



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


        /* --- CHESS --- */

        // creating games
        modelBuilder.Entity<ChessGame>()
             .HasIndex(g => g.Id)
             .IsUnique();

        // player relations
        modelBuilder.Entity<ChessGame>()
            .HasOne(g => g.White)
            .WithMany(w => w.GamesAsWhite)
            .HasForeignKey(g => g.WhiteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ChessGame>()
            .HasOne(g => g.Black)
            .WithMany(w => w.GamesAsBlack)
            .HasForeignKey(g => g.BlackId)
            .OnDelete(DeleteBehavior.Restrict);


        /* --- PROJECT --- */
        modelBuilder.Entity<Project>()
             .HasIndex(g => g.Id)
             .IsUnique();
    }
}
