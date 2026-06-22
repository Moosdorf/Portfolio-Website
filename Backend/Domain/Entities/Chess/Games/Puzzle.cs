namespace Backend.Domain.Entities.Chess.Games;

public class Puzzle
{
    public int Id { get; set; }
    public string PuzzleId { get; set; } // From CSV
    public string FEN { get; set; }
    public string Moves { get; set; }
    public int Rating { get; set; }
    public int RatingDeviation { get; set; }
    public int Popularity { get; set; }
    public int NbPlays { get; set; }
    public string Themes { get; set; }
    public string GameUrl { get; set; }
    public string OpeningTags { get; set; }

}
