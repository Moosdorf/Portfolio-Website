namespace Backend.Application.Chess.Responses;

public class StartGameResponse
{
    public int GameId { get; set; } = -1;
    public bool Successful { get; set; } = false;
}
