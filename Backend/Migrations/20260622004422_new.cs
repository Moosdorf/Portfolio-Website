using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class @new : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Puzzles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PuzzleId = table.Column<string>(type: "text", nullable: false),
                    FEN = table.Column<string>(type: "text", nullable: false),
                    Moves = table.Column<string>(type: "text", nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    RatingDeviation = table.Column<int>(type: "integer", nullable: false),
                    Popularity = table.Column<int>(type: "integer", nullable: false),
                    NbPlays = table.Column<int>(type: "integer", nullable: false),
                    Themes = table.Column<string>(type: "text", nullable: false),
                    GameUrl = table.Column<string>(type: "text", nullable: false),
                    OpeningTags = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Puzzles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ChessGames",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GameType = table.Column<int>(type: "integer", nullable: false),
                    WhiteId = table.Column<int>(type: "integer", nullable: false),
                    WhiteUsername = table.Column<string>(type: "text", nullable: false),
                    WhitePlayerId = table.Column<int>(type: "integer", nullable: false),
                    BlackId = table.Column<int>(type: "integer", nullable: false),
                    BlackUsername = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Result = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChessGames", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChessGames_Users_BlackId",
                        column: x => x.BlackId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ChessGames_Users_WhitePlayerId",
                        column: x => x.WhitePlayerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Moves",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MoveString = table.Column<string>(type: "text", nullable: false),
                    FEN = table.Column<string>(type: "text", nullable: false),
                    ChessGameId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Moves", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Moves_ChessGames_ChessGameId",
                        column: x => x.ChessGameId,
                        principalTable: "ChessGames",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChessGames_BlackId",
                table: "ChessGames",
                column: "BlackId");

            migrationBuilder.CreateIndex(
                name: "IX_ChessGames_Id",
                table: "ChessGames",
                column: "Id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChessGames_WhitePlayerId",
                table: "ChessGames",
                column: "WhitePlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_Moves_ChessGameId",
                table: "Moves",
                column: "ChessGameId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_Id",
                table: "Projects",
                column: "Id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Id",
                table: "Users",
                column: "Id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Moves");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "Puzzles");

            migrationBuilder.DropTable(
                name: "ChessGames");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
