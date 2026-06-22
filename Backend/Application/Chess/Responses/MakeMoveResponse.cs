using Backend.Domain.Entities.Chess;
using Backend.Domain.Entities.Chess.Games;

namespace Backend.Application.Chess.Responses;

public class MakeMoveResponse
{
    public ChessMove Move { get; set; }
    public ChessGame Game { get; set; }
    public bool Successful { get; set; } = false;

}
