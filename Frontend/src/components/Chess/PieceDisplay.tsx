import { useAuth } from '../../data/providers/AuthProvider';
import { useChessBoard } from './ChessBoardContext';
import { PieceType, PromotionType, type ChessPiece, type PromotionSquare } from './ChessTypes';

function PieceDisplay({ piece }: { piece: ChessPiece }) {
    const { chessGame, selectedPiece, setSelectedPiece, promotionInfo, setPromotionInfo, activePlayer, attack, isMoving } = useChessBoard()
    const { user } = useAuth();

    const color = piece.IsWhite ? "white" : "black";
    const promotionListSortedHighToLow = [PromotionType.Queen, PromotionType.Rook, PromotionType.Bishop, PromotionType.Knight];
    const isSelected = piece === selectedPiece;
    const isMove = selectedPiece && selectedPiece.AvailableMoves.includes(piece.Position);
    const isTarget = selectedPiece && selectedPiece.AvailableCaptures.includes(piece.Position);

    const whitesTurn = chessGame?.ChessBoard.Turn === "w";
    // True only for the client whose turn it actually is right now —
    // guards both click-to-move and drag-to-move.
    const isMyTurn = !!user && activePlayer === user.username;

    const drag = (e: React.DragEvent<HTMLDivElement>, piece: ChessPiece) => {
        e.currentTarget.style.opacity = '0.6';
        const dragImage = document.createElement('div');
        dragImage.style.backgroundImage = `url(/chess_images/${piece.IsWhite ? "white" : "black"}-${piece.Type}.png)`;
        dragImage.style.backgroundSize = 'cover';
        dragImage.style.width = '75px';
        dragImage.style.height = '75px';
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-9999px';
        dragImage.style.opacity = '1';

        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 37, 37);
        setTimeout(() => document.body.removeChild(dragImage), 0);
        e.dataTransfer.setData("text", JSON.stringify(piece));
    }

    const dragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();
    }

    const dragEnd = (e: React.DragEvent<HTMLDivElement>, piece: ChessPiece) => {
        e.currentTarget.style.opacity = '1';
        if (piece === selectedPiece) return;
        removeSelected();
    };

    const tryAttack = (target: ChessPiece) => {
        if (selectedPiece &&
            (selectedPiece.AvailableMoves.includes(target.Position) ||
            selectedPiece.AvailableCaptures.includes(target.Position))) {
            attack(target);
            removeSelected();
            return true;
        }
        return false;
    };

    const onDrop = (piece: ChessPiece) => {
        if (isMoving || selectedPiece == null || CheckForPromotion(piece)) return;
        if (piece === selectedPiece) {
            addSelected(piece);
            return;
        }
        tryAttack(piece);
    };

    const handleOnClick = (clickedPiece: ChessPiece) => {
        if (isMoving || promotionInfo || chessGame?.ChessBoard.CheckMate) return;
        if (CheckForPromotion(clickedPiece)) return;

        if (selectedPiece === null) {
            addSelected(clickedPiece);
            return;
        }
        if (clickedPiece === selectedPiece) {
            removeSelected();
            return;
        }

        // if the clicked piece belongs to the same side, reselect it instead of attacking
        if (clickedPiece.IsWhite === selectedPiece.IsWhite) addSelected(clickedPiece);
        tryAttack(clickedPiece);
    };

    const addSelected = (selectedPiece: ChessPiece) => {
        // Only the player whose turn it currently is may select a piece,
        // and only a piece of the color that's actually to move.
        if (isMoving || !isMyTurn) {
            setSelectedPiece(null);
            return;
        }
        if (selectedPiece.IsWhite === whitesTurn && selectedPiece.Type !== PieceType.Empty) {
            setSelectedPiece(selectedPiece);
        }
        else setSelectedPiece(null);
    };

    const removeSelected = () => {
        setSelectedPiece(null);
    };

    const CheckForPromotion = (clickedPiece: ChessPiece) => {
        if (selectedPiece === null || selectedPiece.Type !== PieceType.Pawn) return false;

        const targetRank = clickedPiece.Position[1];
        const isPromotionRank = (selectedPiece.IsWhite && targetRank === '8') ||
            (!selectedPiece.IsWhite && targetRank === '1');

        if (isPromotionRank &&
            (selectedPiece.AvailableMoves.includes(clickedPiece.Position) ||
                selectedPiece.AvailableCaptures.includes(clickedPiece.Position))) {

            const direction = selectedPiece.IsWhite ? -1 : 1;
            const promotionSquares: PromotionSquare[] = [];

            for (let i = 0; i < 4; i++) {
                const rank = String.fromCharCode(targetRank.charCodeAt(0) + (i * direction));
                promotionSquares.push({
                    position: clickedPiece.Position[0] + rank,
                    promotionType: promotionListSortedHighToLow[i]
                });
            }
            setPromotionInfo({
                from: selectedPiece,
                to: clickedPiece,
                promotion: PieceType.Queen
            });
            return true;
        }
        return false;
    }

    let currentTurn = (user && chessGame && activePlayer == user.username && chessGame.Players[0] == activePlayer) ? "currentTurn" : ""
    let squareClass = `piece-cell ${isSelected ? "selected" : ""}`;
    let pieceClass = `${currentTurn} piece`;

    const lastMoves = chessGame?.ChessBoard.LastMove.split(",");
    if (lastMoves && piece.Position == lastMoves[1]) {
        squareClass += " movedTo";
    }
    if (lastMoves && piece.Position == lastMoves[0]) {
        squareClass += " movedFrom";
    }

    if (piece.Type === PieceType.King && piece.IsWhite === (chessGame?.ChessBoard.Turn === "w")) {
        if (chessGame?.ChessBoard.InCheck) squareClass += " check";
        if (chessGame?.ChessBoard.CheckMate) squareClass += " checkmate";
    }

    return (
        <div
            className={squareClass}
            onClick={() => handleOnClick(piece)}
            onDragOver={dragOver}
            onDrop={() => onDrop(piece)}
        >
            {piece.Type != PieceType.Empty &&
                <img
                    className={pieceClass}
                    alt=""
                    draggable={!isMoving && piece.IsWhite === whitesTurn && isMyTurn && !chessGame?.ChessBoard.CheckMate}
                    onDragStart={(e) => {
                        drag(e, piece);
                        addSelected(piece);
                    }}
                    onDragEnd={(e) => dragEnd(e, piece)}
                    src={`/chess_images/${color}-${piece.Type}.png`}
                />}

            {isTarget && <div className='target'></div>}
            {isMove && <div className='move'></div>}
        </div>
    );
}

export default PieceDisplay;