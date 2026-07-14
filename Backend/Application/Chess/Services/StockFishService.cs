using Backend.Application.Chess.DTO;
using System.Diagnostics;

namespace Backend.Application.Chess.Services;

public class StockFishService : IStockFishService
{
    private readonly Process _engine;
    public StockFishService()
    {
        var stockfishPath = Path.GetFullPath("Stockfish/stockfish.exe");
        Console.WriteLine(stockfishPath);
        _engine = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = stockfishPath, 
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true
            }
        };
        _engine.Start(); // start the process (stockfish) and set it to uci mode (Tell the engine to use the UCI (universal chess interface)) https://github.com/official-stockfish/Stockfish/wiki/UCI-&-Commands#uci
        SendCommand("uci");
        Console.WriteLine(WaitForResponse("uciok"));
    }
    public MoveModel MoveFrom(string FEN)
    {
        Console.WriteLine("position fen " + FEN);
        SendCommand("ucinewgame");
        SendCommand("position fen " + FEN);
        SendCommand("go movetime 1000"); 
        string response = WaitForResponse("bestmove").Split(" ")[1];
        char? promotion = null;
        Console.WriteLine(response);

        if (response.Length == 5)
        {
            promotion = response[4];
            response = response[..4];
        }
        if (response.Length == 4) response = response.Insert(2, ","); 

        return new MoveModel { Move = response, Promotion = promotion };
    }

    public void StartNewStockFishGame()
    {
        SendCommand("ucinewgame");
        SendCommand("isready");
        Console.WriteLine(WaitForResponse("readyok"));


        SendCommand("position startpos");
        SendCommand("go movetime 1000");
        Console.WriteLine(WaitForResponse("bestmove"));


    }

    private void SendCommand(string command)
    {
        _engine.StandardInput.WriteLine(command);
    }

    private string WaitForResponse(string keyword)
    {
        string? line;
        while ((line = _engine.StandardOutput.ReadLine()) != null)
        {
            if (line.Contains(keyword))
            {
                Console.WriteLine(line);
                return line;
            }
        }
        return "";
    }
}
