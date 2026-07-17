using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class ChessGameFKFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChessGames_Users_WhitePlayerId",
                table: "ChessGames");

            migrationBuilder.DropIndex(
                name: "IX_ChessGames_WhitePlayerId",
                table: "ChessGames");

            migrationBuilder.DropColumn(
                name: "WhitePlayerId",
                table: "ChessGames");

            migrationBuilder.CreateIndex(
                name: "IX_ChessGames_WhiteId",
                table: "ChessGames",
                column: "WhiteId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChessGames_Users_WhiteId",
                table: "ChessGames",
                column: "WhiteId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChessGames_Users_WhiteId",
                table: "ChessGames");

            migrationBuilder.DropIndex(
                name: "IX_ChessGames_WhiteId",
                table: "ChessGames");

            migrationBuilder.AddColumn<int>(
                name: "WhitePlayerId",
                table: "ChessGames",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ChessGames_WhitePlayerId",
                table: "ChessGames",
                column: "WhitePlayerId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChessGames_Users_WhitePlayerId",
                table: "ChessGames",
                column: "WhitePlayerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
