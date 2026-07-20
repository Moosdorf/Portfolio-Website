import { useState } from "react";
import { Button } from "../../../components/Button";
import { useAuth } from "../../../data/providers/AuthProvider";
import ChessBoardGrid from "../../../components/Chess/ChessBoardGrid";
import ChessPuzzleProvider from "../../../data/providers/ChessPuzzleProvider";
import { useChessPuzzle } from "../../../components/Chess/ChessPuzzleContext";
import { useChessBoard } from "../../../components/Chess/ChessBoardContext";
import MoveHistory from "../../../components/Chess/MoveHistory";
import SelectionPanel from "../../../components/SelectionPanel";
import { Link } from "react-router-dom";
import InfoPanel from "../../../components/Chess/InfoPanel";

function ChessPuzzle() {
    return (
        <ChessPuzzleProvider>
            <ChessPuzzleDisplay />
        </ChessPuzzleProvider>
    );
}

function ChessPuzzleDisplay() {
    const { user } = useAuth();
    const { currentPuzzle, fetchNewPuzzle, isFetching, getHint, hint, revealSolution, isRevealed, isSolved } = useChessPuzzle();
    const { chessGame } = useChessBoard();
    const [selectingTag, setSelectingTag] = useState(false);

    if (currentPuzzle == null) {
        if (selectingTag) {
            return (
                <></>
            );
        }

        return (
            <SelectionPanel title="Puzzles" subtitle="Select Gamemode">
                <div className="flex gap-4 justify-center">
                    <Button variant="secondary" onClick={() => fetchNewPuzzle()} disabled={!user || isFetching}>
                        {isFetching ? "Loading..." : "Random Puzzle"}
                    </Button>
                    <Button variant="secondary">Rated Puzzles</Button>
                    <Button variant="secondary" onClick={() => setSelectingTag(true)}>Puzzle Tags</Button>
                </div>

                <Link to="/projects/chess">
                    <Button variant="secondary">Back</Button>
                </Link>
            </SelectionPanel>
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
            

            <InfoPanel
                title="Puzzle Info"
                extraStatus={[
                    { condition: isSolved, className: "status-solved", label: "Puzzle Solved!" },
                    { condition: isRevealed && !isSolved, className: "status-revealed", label: "Solution revealed" },
                ]}
            >
                <h5 className="puzzle-id">#{currentPuzzle.puzzleId}</h5>

                {currentPuzzle.tags?.length > 0 && (
                    <div className="tag-list">
                        {currentPuzzle.tags.map(tag => (
                            <span key={tag} className="tag-pill">{tag.replace(/_/g, " ")}</span>
                        ))}
                    </div>
                )}

                <h5 className="rating-badge">Rating: {currentPuzzle.rating}</h5>

                <div className="last-move-slot">
                    {<h5>Last move: {chessGame.chessBoard.lastMove && chessGame.chessBoard.lastMove}</h5>}
                </div>



                <MoveHistory chessHistory={[]} viewIndex={null} isViewingHistory={false} setViewIndex={function (index: number | null): void {
                    throw new Error("Function not implemented.");
                } } goToPrevious={function (): void {
                    throw new Error("Function not implemented.");
                } } goToNext={function (): void {
                    throw new Error("Function not implemented.");
                } } goToCurrent={function (): void {
                    throw new Error("Function not implemented.");
                } } />



                <div className="puzzle-actions">
                    <Button variant="secondary" onClick={getHint} disabled={isSolved || isRevealed || !hint} className="w-19">Hint</Button>
                    <Button variant="secondary" onClick={revealSolution} disabled={isSolved || isRevealed}>Reveal Solution</Button>
                </div>
                <Button variant="secondary" onClick={handleNextPuzzle} disabled={isFetching}>
                    {isFetching ? "Loading..." : "Next Puzzle"}
                </Button>


                <div className="puzzle-stats">
                    <span>{currentPuzzle.nbPlays.toLocaleString()} plays</span>
                    <span>{currentPuzzle.popularity}% popularity</span>
                </div>
            </InfoPanel>

        </div>
    );
}

export default ChessPuzzle;