import { useState } from "react";
import { Button } from "../../../components/Button";
import { useAuth } from "../../../data/providers/AuthProvider";
import ChessBoardGrid from "../../../components/Chess/ChessBoardGrid";
import ChessPuzzleProvider from "../../../data/providers/ChessPuzzleProvider";
import { useChessPuzzle } from "../../../components/Chess/ChessPuzzleContext";
import { useChessBoard } from "../../../components/Chess/ChessBoardContext";

function ChessPuzzleDisplay() {
    return (
        <ChessPuzzleProvider>
            <ChessPuzzleInner />
        </ChessPuzzleProvider>
    );
}

function ChessPuzzleInner() {
    const { user } = useAuth();
    const { currentPuzzle, fetchNewPuzzle, isFetching } = useChessPuzzle();
    const { chessGame } = useChessBoard();
    const [selectingTag, setSelectingTag] = useState(false);
    if (currentPuzzle == null) {
        if (selectingTag) {
            return (
                <div className="flex flex-col items-center gap-6 max-w-4xl mx-auto p-10 bg-gray-400 rounded-xl shadow-md">
                    <h3 className="text-black font-bold text-lg tracking-wide">Chess Tags</h3>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center gap-6 max-w-4xl mx-auto p-10 bg-gray-400 rounded-xl shadow-md">
                <h3 className="text-black font-bold text-lg tracking-wide">Puzzles</h3>
                <Button onClick={() => fetchNewPuzzle()} disabled={!user || isFetching}>
                    {isFetching ? "Loading..." : "Random Puzzle"}
                </Button>
                <Button>Rated Puzzles</Button>
                <Button onClick={() => setSelectingTag(true)}>Puzzle Tags</Button>
            </div>
        );
    }

    if (chessGame == null) {
        return <div>loading puzzle</div>;
    }

    const isUserWhite = chessGame.Players[0] === user.username;
    const topPlayer = isUserWhite ? chessGame.Players[1] : chessGame.Players[0];
    const bottomPlayer = isUserWhite ? chessGame.Players[0] : chessGame.Players[1];
    const topTurn = isUserWhite ? "b" : "w";
    const bottomTurn = isUserWhite ? "w" : "b";

    return (
        <div className="board-layout">
            <div className="fake-info-panel"></div>

            <div className="board-column">
                <div className={`player-bar ${chessGame.ChessBoard.Turn === topTurn ? "active" : ""}`}>
                    <span className="player-name">{topPlayer || "Waiting for opponent…"}</span>
                </div>

                <ChessBoardGrid />

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
    );
}

export default ChessPuzzleDisplay;