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
    const { currentPuzzle, fetchNewPuzzle, isFetching, hintSquare, revealSolution, isRevealed, isSolved } = useChessPuzzle();
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

    const isUserWhite = chessGame.players[0] === user.username;
    const topPlayer = isUserWhite ? chessGame.players[1] : chessGame.players[0];
    const bottomPlayer = isUserWhite ? chessGame.players[0] : chessGame.players[1];
    const topTurn = isUserWhite ? "b" : "w";
    const bottomTurn = isUserWhite ? "w" : "b";

    const handleNextPuzzle = () => {
        fetchNewPuzzle();
    };

    return (
        <div className="board-layout">
            <div className="fake-info-panel"></div>

            <div className="board-column">
                <div className={`player-bar ${chessGame.chessBoard.turn === topTurn ? "active" : ""}`}>
                    <span className="player-name">{topPlayer || "Waiting for opponent…"}</span>
                </div>

                <ChessBoardGrid/>

                <div className={`player-bar ${chessGame.chessBoard.turn === bottomTurn ? "active" : ""}`}>
                    <span className="player-name">{bottomPlayer}</span>
                </div>
            </div>

            <div className="info-panel border">
                <h2 className="puzzle-info-heading">Puzzle Info</h2>
                <h5 className="puzzle-id">#{currentPuzzle.puzzleId}</h5>
                <h5 className="rating-badge">Rating: {currentPuzzle.rating}</h5>

                {chessGame.chessBoard.checkMate ? (
                    <p className="status-line status-checkmate">
                        Checkmate: {chessGame.chessBoard.winner} wins
                    </p>
                ) : chessGame.chessBoard.inCheck ? (
                    <p className="status-line status-check">Check</p>
                ) : null}

                {chessGame.chessBoard.lastMove && <h5>Last move: {chessGame.chessBoard.lastMove}</h5>}

                {currentPuzzle.tags?.length > 0 && (
                    <div className="tag-list">
                        {currentPuzzle.tags.map(tag => (
                            <span key={tag} className="tag-pill">
                                {tag.replace(/_/g, " ")}
                            </span>
                        ))}
                    </div>
                )}
                <h5>Move: {chessGame.chessBoard.fullMoveClock}</h5>

                <div>
                    {isSolved && (
                        <div className="status-line status-solved">
                            Puzzle Solved!
                        </div>
                    )}
                    {isRevealed && !isSolved && (
                        <div className="status-line status-revealed">
                            Solution revealed
                        </div>
                    )}
                </div>

                <div className="puzzle-actions">
                    <Button
                        disabled={isSolved || isRevealed || !hintSquare}
                    >
                        Hint
                    </Button>
                    <Button
                        onClick={revealSolution}
                        disabled={isSolved || isRevealed}
                    >
                        Reveal Solution
                    </Button>
                    <Button onClick={handleNextPuzzle} disabled={isFetching}>
                        {isFetching ? "Loading..." : "Next Puzzle"}
                    </Button>
                </div>

                <div className="puzzle-stats">
                    <span>{currentPuzzle.nbPlays.toLocaleString()} plays</span>
                    <span>{currentPuzzle.popularity}% popularity</span>
                </div>
            </div>
        </div>
    );
}

export default ChessPuzzleDisplay;