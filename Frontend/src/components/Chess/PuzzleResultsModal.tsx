import Modal from "../Modal";
import { Button } from "../Button";
import { useChessPuzzle } from "./ChessPuzzleContext";

function PuzzleResultModal() {
    const {
        showResultModal,
        closeResultModal,
        isSolved,
        wrongMoveMade,
        isRevealed,
        hint,
        puzzleAttemptResult,
        puzzleMode,
        fetchRandomPuzzle,
        fetchRankedPuzzle,
        isFetchingRandom,
        isFetchingRanked,
    } = useChessPuzzle();

    const hintUsed = hint.length > 0;
    const solved = isSolved && !wrongMoveMade && !isRevealed && !hintUsed;
    const isFetchingNext = isFetchingRandom || isFetchingRanked;

    // priority: revealed > hint > wrong move — matches IsPuzzleSolved's own precedence server-side
    const title = solved
        ? "Puzzle Solved!"
        : isRevealed
        ? "Puzzle Failed: Solution Revealed"
        : hintUsed
        ? "Puzzle Failed: Hint Used"
        : "Puzzle Failed: Incorrect Move";

    const hasRatingChange = puzzleAttemptResult != null;
    const ratingBefore = puzzleAttemptResult?.ratingBefore;
    const ratingAfter = puzzleAttemptResult?.ratingAfter;
    const ratingDelta = hasRatingChange ? (ratingAfter! - ratingBefore!) : 0;

    const handleNewPuzzle = () => {
        closeResultModal();
        switch (puzzleMode.puzzleType) {
            case "ranked": fetchRankedPuzzle(); break;
            case "random": fetchRandomPuzzle(); break;
        }
    };

    return (
        <Modal isOpen={showResultModal} onClose={closeResultModal} title={title}>

            {hasRatingChange && (
                <div className="rating-change">
                    <span className="rating-old">{ratingBefore}</span>
                    <span className="rating-arrow">→</span>
                    <span className={`rating-new ${ratingDelta >= 0 ? "rating-up" : "rating-down"}`}>
                        {ratingAfter}
                    </span>
                    <span className={`rating-delta ${ratingDelta >= 0 ? "rating-up" : "rating-down"}`}>
                        ({ratingDelta >= 0 ? "+" : ""}{ratingDelta})
                    </span>
                </div>
            )}

            <div className="modal-actions">
                <Button variant="secondary" onClick={handleNewPuzzle} disabled={isFetchingNext}>
                    {isFetchingNext ? "Loading..." : "New Puzzle"}
                </Button>
                <Button variant="secondary" onClick={closeResultModal}>Close</Button>
            </div>
        </Modal>
    );
}

export default PuzzleResultModal;