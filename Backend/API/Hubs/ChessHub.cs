using Microsoft.AspNetCore.SignalR;

public class ChessHub : Hub
{
    // Client calls this after connecting to join a specific game's "room"
    public async Task JoinGame(string gameId)
    {
        if (gameId == null) return;
        Console.WriteLine(gameId + ": trying to connect user to game");
        await Groups.AddToGroupAsync(Context.ConnectionId, $"game-{gameId}");
        Console.WriteLine(gameId + ": success");
    }

    public async Task LeaveGame(string gameId)
    {
        if (gameId == null) return;
        Console.WriteLine(gameId + ": trying to leave game");
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"game-{gameId}");
        Console.WriteLine(gameId + ": left success");
    }
}