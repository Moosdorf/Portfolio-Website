
using Backend.Application.Chess.DTO;


namespace Backend.Application.Chess.Services;

public interface IStockFishService
{
    MoveModel MoveFrom(string fEN);
    public void StartNewStockFishGame();

}
