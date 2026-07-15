using Backend.Domain.Entities.Chess.Games;

namespace Backend.Application.Chess.DTO;

public class PuzzleDTO
{
    public string PuzzleId { get; set; }
    public ChessBoard ChessBoard { get; set; } = null!;
    public string FEN { get; set; }
    public int Rating { get; set; }
    public int RatingDeviation { get; set; }
    public int Popularity { get; set; }
    public int NbPlays { get; set; }
    public string GameUrl { get; set; }
    public List<string> OpeningTags { get; set; }
    public List<string> Moves { get; set; }
    public List<string> Tags { get; set; }
}
public class TagDTO
{
    public string Name { get; set; }

}
