import { useState, useCallback } from "react"
import type { ChessGame, ChessPuzzle } from "../../../components/Chess/ChessTypes";
import { Button } from "../../../components/Button";
import { useAuth } from "../../../data/providers/AuthProvider";
import ChessBoardGrid from "../../../components/Chess/ChessBoardGrid";
import PuzzleBoardProvider from "../../../data/providers/ChessPuzzleProvider";

function ChessPuzzleDisplay() {
    const { user } = useAuth()
    const [selectingTag, setSelectingTag] = useState(false);
    const [currentPuzzle, setCurrentPuzzle] = useState<ChessPuzzle>()
    const [chessGame, setChessGame] = useState<ChessGame>()

    const fetchNewPuzzle = useCallback(async () => {
        try {
            const res = await fetch(`https://localhost:5270/api/puzzle/random`, {
                method: 'GET'
            });
            if (!res.ok) {
                throw new Error(`Failed to load board: ${res.status}`);
            }

            console.log("puzzle")
            const puzzle: ChessPuzzle = await res.json();
            setCurrentPuzzle(puzzle);
            console.log(puzzle)
            const newGame = {
                ChessBoard: puzzle.ChessBoard,
                Id: -1,
                SessionId: "",
                GameType: "Puzzle",
                Players: [puzzle.ChessBoard.Turn == "w" ? user.username : "puzzle", puzzle.ChessBoard.Turn == "b" ? user.username : "puzzle"],
                Moves: [],
                FenList: [puzzle.FEN],
                GameStarted: "",
            } satisfies ChessGame;

            if (newGame === null) return;
            if (user && user.username === newGame.Players[0]) {
                newGame.ChessBoard.GameBoard = newGame.ChessBoard.GameBoard.slice().reverse();
            }
            setChessGame(newGame);

        } catch (err) {
            console.error('Failed to fetch chess board:', err);
        }
    }, [user]);

    if (currentPuzzle == null) {
        if (selectingTag) {
            return (
                <div className="flex flex-col items-center gap-6 max-w-4xl mx-auto p-10 bg-gray-400 rounded-xl shadow-md">
                    <h3 className="text-black font-bold text-lg tracking-wide">Chess Tags</h3>
                </div>
            )
        }

        return (
            <div className="flex flex-col items-center gap-6 max-w-4xl mx-auto p-10 bg-gray-400 rounded-xl shadow-md">
                <h3 className="text-black font-bold text-lg tracking-wide">Puzzles</h3>
                <Button onClick={() => fetchNewPuzzle()} disabled={!user}>
                    Random Puzzle
                </Button>
                <Button>
                    Rated Puzzles
                </Button>
                <Button onClick={() => setSelectingTag(true)}>
                    Puzzle Tags
                </Button>
            </div>
        )
    }
    if (chessGame == null) return (
        <div>
            loading puzzle
        </div>
    )

    const isUserWhite = chessGame.Players[0] === user.username;

    const topPlayer = isUserWhite
        ? chessGame.Players[1]
        : chessGame.Players[0];

    const bottomPlayer = isUserWhite
        ? chessGame.Players[0]
        : chessGame.Players[1];

    const topTurn = isUserWhite ? "b" : "w";
    const bottomTurn = isUserWhite ? "w" : "b";
    console.log(chessGame)
    // puzzle
    return (
    <PuzzleBoardProvider initialGame={chessGame} puzzleId={currentPuzzle.PuzzleId} solutionMoves={currentPuzzle.Moves}>
            <div className="board-layout">
                <div className="fake-info-panel"></div>

                <div className="board-column">   
                    {/* Opponent */}
                    <div className={`player-bar ${chessGame.ChessBoard.Turn === topTurn ? "active" : ""}`}>
                        <span className="player-name">
                            {topPlayer || "Waiting for opponent…"}
                        </span>
                    </div>

                    {/* Chessboard */}
                    <ChessBoardGrid />

                    {/* You */}
                    <div className={`player-bar ${chessGame.ChessBoard.Turn === bottomTurn ? "active" : ""}`}>
                        <span className="player-name">{bottomPlayer}</span>
                    </div>
                </div>

                <div className="info-panel border">
                    <h2 className="puzzle-info-heading">Puzzle Info</h2>
                    <h5 className="puzzle-id">#{currentPuzzle.PuzzleId}</h5>
                    <h5 className="rating-badge">Rating: {currentPuzzle.Rating}</h5>

                    {chessGame.ChessBoard.CheckMate ? (
                        <p className="status-line status-checkmate">
                            Checkmate: {chessGame.ChessBoard.Winner} wins
                        </p>
                    ) : chessGame.ChessBoard.InCheck ? (
                        <p className="status-line status-check">Check</p>
                    ) : null}


                    {chessGame.ChessBoard.LastMove && <h5>Last move: {chessGame.ChessBoard.LastMove}</h5>}

                    {currentPuzzle.Tags?.length > 0 && (
                        <div className="tag-list">
                            {currentPuzzle.Tags.map(tag => (
                                <span key={tag} className="tag-pill">
                                    {tag.replace(/_/g, " ")}
                                </span>
                            ))}
                        </div>
                    )}
                    <h5>Move: {chessGame.ChessBoard.FullMoveClock}</h5>

                    <div className="puzzle-stats">
                        <span>{currentPuzzle.NbPlays.toLocaleString()} plays</span>
                        <span>{currentPuzzle.Popularity}% popularity</span>
                    </div>
                </div>
            </div>
    </PuzzleBoardProvider>
    )
        
}


export default ChessPuzzleDisplay