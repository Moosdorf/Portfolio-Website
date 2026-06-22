using Backend.Domain.Entities.Users;

namespace Backend.Application.Chess.DTO;

public class ChessGameDto
{
    public int Id { get; set; }
    public User White { get; set; }
    public User Black { get; set; }
    public int Moves { get; set; }
    public DateTime GameStarted { get; set; }
}
