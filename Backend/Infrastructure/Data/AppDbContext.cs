using Backend.Domain.Entities.Chess.Games;
using Backend.Domain.Entities.Project;
using Backend.Domain.Entities.Users;
using DataLayer.csv_scripts;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    // db sets
    public DbSet<User> Users { get; set; }

    // cheess
    public DbSet<ChessGame> ChessGames { get; set; }
    public DbSet<Move> Moves { get; set; }
    public DbSet<Puzzle> Puzzles { get; set; }
    public DbSet<Tag> Tags { get; set; }


    // projects
    public DbSet<Project> Projects { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        /* --- USER --- */
        // creating the entity entry with its specifications
        // Entities must have "public int Id { get; set; }" as a variable, EF core makes this its PK and auto increments it.
        modelBuilder.Entity<User>()
             .HasIndex(g => g.Id)
             .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
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
            .HasOne(game => game.WhitePlayer)
            .WithMany(user => user.GamesAsWhite)
            .HasForeignKey(game => game.WhiteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ChessGame>()
            .HasOne(game => game.BlackPlayer)
            .WithMany(user => user.GamesAsBlack)
            .HasForeignKey(game => game.BlackId)
            .OnDelete(DeleteBehavior.Restrict);

        // puzzles and puzzle tags
        modelBuilder.Entity<PuzzleTag>(entity =>
        {
            entity.HasKey(pt => new { pt.PuzzleId, pt.TagId });

            entity.HasOne(pt => pt.Puzzle)
                .WithMany(p => p.PuzzleTags)
                .HasForeignKey(pt => pt.PuzzleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(pt => pt.Tag)
                .WithMany(t => t.PuzzleTags)
                .HasForeignKey(pt => pt.TagId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(pt => pt.TagId);
        });

        modelBuilder.Entity<Tag>()
            .HasIndex(t => t.Name)
            .IsUnique();


        /* --- PROJECT --- */
        modelBuilder.Entity<Project>()
             .HasIndex(g => g.Id)
             .IsUnique();
    }
}
