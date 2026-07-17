import { useAuth } from '../../data/providers/AuthProvider';
import { useChessBoard } from './ChessBoardContext';
import { PieceType, PromotionType, type ChessPiece, type PromotionSquare } from './ChessTypes';

function PieceDisplay({ piece }: { piece: ChessPiece }) {
    const { chessGame, selectedPiece, setSelectedPiece, promotionInfo, setPromotionInfo, activePlayer, attack, isMoving } = useChessBoard()
    const { user } = useAuth();

    const color = piece.isWhite ? "white" : "black";
    const promotionListSortedHighToLow = [PromotionType.queen, PromotionType.rook, PromotionType.bishop, PromotionType.knight];
    const isSelected = piece === selectedPiece;
    const isMove = selectedPiece && selectedPiece.availableMoves.includes(piece.position);
    const isTarget = selectedPiece && selectedPiece.availableCaptures.includes(piece.position);

    const whitesTurn = chessGame?.chessBoard.turn === "w";
    // True only for the client whose turn it actually is right now —
    // guards both click-to-move and drag-to-move.
    const isMyTurn = !!user && activePlayer === user.username;

    const drag = (e: React.DragEvent<HTMLDivElement>, piece: ChessPiece) => {
        e.currentTarget.style.opacity = '0.6';
        const dragImage = document.createElement('div');
        dragImage.style.backgroundImage = `url(/chess_images/${piece.isWhite ? "white" : "black"}-${piece.type}.png)`;
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
            (selectedPiece.availableMoves.includes(target.position) ||
            selectedPiece.availableCaptures.includes(target.position))) {
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
        if (isMoving || promotionInfo || chessGame?.chessBoard.checkMate) return;
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
        if (clickedPiece.isWhite === selectedPiece.isWhite) addSelected(clickedPiece);
        tryAttack(clickedPiece);
    };

    const addSelected = (selectedPiece: ChessPiece) => {
        // Only the player whose turn it currently is may select a piece,
        // and only a piece of the color that's actually to move.
        if (isMoving || !isMyTurn) {
            setSelectedPiece(null);
            return;
        }
        if (selectedPiece.isWhite === whitesTurn && selectedPiece.type !== PieceType.empty) {
            setSelectedPiece(selectedPiece);
        }
        else setSelectedPiece(null);
    };

    const removeSelected = () => {
        setSelectedPiece(null);
    };

    const CheckForPromotion = (clickedPiece: ChessPiece) => {
        if (selectedPiece === null || selectedPiece.type !== PieceType.pawn) return false;

        const targetRank = clickedPiece.position[1];
        const isPromotionRank = (selectedPiece.isWhite && targetRank === '8') ||
            (!selectedPiece.isWhite && targetRank === '1');

        if (isPromotionRank &&
            (selectedPiece.availableMoves.includes(clickedPiece.position) ||
                selectedPiece.availableCaptures.includes(clickedPiece.position))) {

            const direction = selectedPiece.isWhite ? -1 : 1;
            const promotionSquares: PromotionSquare[] = [];

            for (let i = 0; i < 4; i++) {
                const rank = String.fromCharCode(targetRank.charCodeAt(0) + (i * direction));
                promotionSquares.push({
                    position: clickedPiece.position[0] + rank,
                    promotionType: promotionListSortedHighToLow[i]
                });
            }
            setPromotionInfo({
                from: selectedPiece,
                to: clickedPiece,
                promotion: PieceType.queen
            });
            return true;
        }
        return false;
    }

    let currentTurn = (user && chessGame && activePlayer == user.username && chessGame.players[0] == activePlayer) ? "currentTurn" : ""
    let squareClass = `piece-cell ${isSelected ? "selected" : ""}`;
    let pieceClass = `${currentTurn} piece`;

    const lastMoves = chessGame?.chessBoard.lastMove.split(",");
    if (lastMoves && piece.position == lastMoves[1]) {
        squareClass += " movedTo";
    }
    if (lastMoves && piece.position == lastMoves[0]) {
        squareClass += " movedFrom";
    }

    if (piece.type === PieceType.king && piece.isWhite === (chessGame?.chessBoard.turn === "w")) {
        if (chessGame?.chessBoard.inCheck) squareClass += " check";
        if (chessGame?.chessBoard.checkMate) squareClass += " checkmate";
    }

    return (
        <div
            className={squareClass}
            onClick={() => handleOnClick(piece)}
            onDragOver={dragOver}
            onDrop={() => onDrop(piece)}
        >
            {piece.type != PieceType.empty &&
                <img
                    className={pieceClass}
                    alt=""
                    draggable={!isMoving && piece.isWhite === whitesTurn && isMyTurn && !chessGame?.chessBoard.checkMate}
                    onDragStart={(e) => {
                        drag(e, piece);
                        addSelected(piece);
                    }}
                    onDragEnd={(e) => dragEnd(e, piece)}
                    src={`/chess_images/${color}-${piece.type}.png`}
                />}

            {isTarget && <div className='target'></div>}
            {isMove && <div className='move'></div>}
        </div>
    );
}

export default PieceDisplay;