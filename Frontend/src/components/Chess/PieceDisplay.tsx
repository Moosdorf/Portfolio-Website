import { useAuth } from '../../data/providers/AuthProvider';
import { useChessBoard } from './ChessBoardContext';
import { PieceType, PromotionType, type ChessPiece, type PromotionSquare } from './ChessTypes';

interface PieceDisplayProps {
    piece: ChessPiece;
    squareClass: string;
    pieceClass: string;
    color: string;
    isMove: boolean;
    isTarget: boolean;
}

function PieceDisplay({ piece, squareClass, pieceClass, color, isMove, isTarget }: PieceDisplayProps) {
    const { chessGame, selectedPiece, setSelectedPiece, promotionInfo, setPromotionInfo,
        activePlayer, attack, isMoving, isViewingHistory } = useChessBoard();

    const { user } = useAuth();

    const promotionListSortedHighToLow = [PromotionType.queen, PromotionType.rook, PromotionType.bishop, PromotionType.knight];
    const whitesTurn = chessGame?.chessBoard.turn === "w";
    const isMyTurn = !!user && activePlayer === user.username;
    const isPromotingFrom = promotionInfo?.from.position === piece.position;

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
            console.log(selectedPiece.position+  " trying to attack " + target.position)
            attack(target);
            removeSelected();
            return true;
        }
        
        setSelectedPiece(null)
        return false;
    };

    const onDrop = (piece: ChessPiece) => {
        if (isViewingHistory || isMoving || selectedPiece == null || CheckForPromotion(piece)) return;
        if (piece === selectedPiece) {
            addSelected(piece);
            return;
        }
        tryAttack(piece);
    };

    const handleOnClick = (clickedPiece: ChessPiece) => {
        console.log(clickedPiece)
        if (isViewingHistory || isMoving) return;

        if (promotionInfo) {
            setPromotionInfo(null);
            setSelectedPiece(null);
            return;
        }

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
        if (clickedPiece.isWhite === selectedPiece.isWhite && clickedPiece.type !== PieceType.empty) {
            addSelected(clickedPiece);
            return;
        }
        tryAttack(clickedPiece);
    };

    const addSelected = (selectedPiece: ChessPiece) => {
        if (isViewingHistory || isMoving || !isMyTurn || chessGame?.chessBoard.checkMate) {
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
                options: promotionSquares  // now actually used
            });
            return true;
        }
        return false;
    }
    return (
        <div
            className={squareClass}
            onClick={() => handleOnClick(piece)}
            onDragOver={dragOver}
            onDrop={() => onDrop(piece)}
        >
            {piece.type != PieceType.empty && !isPromotingFrom && 
                <img
                    className={pieceClass}
                    alt=""
                    draggable={!isViewingHistory && !isMoving && piece.isWhite === whitesTurn && isMyTurn && !chessGame?.chessBoard.checkMate}
                    onDragStart={(e) => {
                        drag(e, piece);
                        addSelected(piece);
                    }}
                    onDragEnd={(e) => dragEnd(e, piece)}
                    src={`/chess_images/${color}-${piece.type}.png`}
                />}
            {isTarget && <div className="target" />}
            {isMove && <div className="move" />}
        </div>
    );
}

export default PieceDisplay;