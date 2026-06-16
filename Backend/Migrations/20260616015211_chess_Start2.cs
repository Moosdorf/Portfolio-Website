using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class chess_Start2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_chessGames_Users_BlackId",
                table: "chessGames");

            migrationBuilder.DropForeignKey(
                name: "FK_chessGames_Users_WhiteId",
                table: "chessGames");

            migrationBuilder.DropPrimaryKey(
                name: "PK_chessGames",
                table: "chessGames");

            migrationBuilder.RenameTable(
                name: "chessGames",
                newName: "ChessGames");

            migrationBuilder.RenameIndex(
                name: "IX_chessGames_WhiteId",
                table: "ChessGames",
                newName: "IX_ChessGames_WhiteId");

            migrationBuilder.RenameIndex(
                name: "IX_chessGames_Id",
                table: "ChessGames",
                newName: "IX_ChessGames_Id");

            migrationBuilder.RenameIndex(
                name: "IX_chessGames_BlackId",
                table: "ChessGames",
                newName: "IX_ChessGames_BlackId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ChessGames",
                table: "ChessGames",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ChessGames_Users_BlackId",
                table: "ChessGames",
                column: "BlackId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

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
                name: "FK_ChessGames_Users_BlackId",
                table: "ChessGames");

            migrationBuilder.DropForeignKey(
                name: "FK_ChessGames_Users_WhiteId",
                table: "ChessGames");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ChessGames",
                table: "ChessGames");

            migrationBuilder.RenameTable(
                name: "ChessGames",
                newName: "chessGames");

            migrationBuilder.RenameIndex(
                name: "IX_ChessGames_WhiteId",
                table: "chessGames",
                newName: "IX_chessGames_WhiteId");

            migrationBuilder.RenameIndex(
                name: "IX_ChessGames_Id",
                table: "chessGames",
                newName: "IX_chessGames_Id");

            migrationBuilder.RenameIndex(
                name: "IX_ChessGames_BlackId",
                table: "chessGames",
                newName: "IX_chessGames_BlackId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_chessGames",
                table: "chessGames",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_chessGames_Users_BlackId",
                table: "chessGames",
                column: "BlackId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_chessGames_Users_WhiteId",
                table: "chessGames",
                column: "WhiteId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
