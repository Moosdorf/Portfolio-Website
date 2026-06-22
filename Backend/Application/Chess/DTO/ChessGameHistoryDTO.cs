using Backend.Domain.Entities.Chess.Games;

namespace Backend.Application.Chess.DTO;


public class ChessGameHistoryDTO
{
    public int Id { get; set; }
    public string WhitePlayer { get; set; }
    public string BlackPlayer { get; set; }
    public string Winner { get; set; }
    public List<Move> Moves { get; set; }
    public float Length { get; set; }
    public string FEN { get; set; }
}
