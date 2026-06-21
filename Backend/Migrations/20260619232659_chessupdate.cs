using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class chessupdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_PasswordHash",
                table: "Users");

            migrationBuilder.AddColumn<string>(
                name: "CurrentState",
                table: "ChessGames",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Id",
                table: "Users",
                column: "Id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Id",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CurrentState",
                table: "ChessGames");

            migrationBuilder.CreateIndex(
                name: "IX_Users_PasswordHash",
                table: "Users",
                column: "PasswordHash",
                unique: true);
        }
    }
}
