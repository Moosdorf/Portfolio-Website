using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class chess_Start : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "chessGames",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WhiteId = table.Column<int>(type: "integer", nullable: false),
                    BlackId = table.Column<int>(type: "integer", nullable: false),
                    Moves = table.Column<int>(type: "integer", nullable: false),
                    FenList = table.Column<List<string>>(type: "text[]", nullable: false),
                    GameStarted = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chessGames", x => x.Id);
                    table.ForeignKey(
                        name: "FK_chessGames_Users_BlackId",
                        column: x => x.BlackId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_chessGames_Users_WhiteId",
                        column: x => x.WhiteId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_chessGames_BlackId",
                table: "chessGames",
                column: "BlackId");

            migrationBuilder.CreateIndex(
                name: "IX_chessGames_Id",
                table: "chessGames",
                column: "Id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_chessGames_WhiteId",
                table: "chessGames",
                column: "WhiteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "chessGames");
        }
    }
}
