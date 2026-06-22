import { useAuth } from '../../data/providers/AuthProvider';
import { useChessBoard } from './ChessBoard';
import { PieceType, PromotionType, type ChessPiece, type PromotionSquare } from './ChessTypes';

function PieceDisplay({ piece }: { piece: ChessPiece }) {
    const { chessGame, selectedPiece, setSelectedPiece, promotionInfo, setPromotionInfo, activePlayer, attack } = useChessBoard()
    const { user } = useAuth();

    const color = piece.isWhite ? "white" : "black";
    const promotionListSortedHighToLow = [PromotionType.Queen, PromotionType.Rook, PromotionType.Bishop, PromotionType.Knight];
    const isSelected = piece === selectedPiece;
    const isMove = selectedPiece && selectedPiece.availableMoves.includes(piece.position);
    const isTarget = selectedPiece && selectedPiece.availableCaptures.includes(piece.position);

    // light/dark derived from the square's own position, independent of board array order
    const fileIndex = piece.position.charCodeAt(0) - 'a'.charCodeAt(0);
    const rankNum = parseInt(piece.position[1], 10);
    const isLight = (fileIndex + rankNum) % 2 === 0;

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

    const onDrop = (piece: ChessPiece) => {
        console.log(`Dropping ${selectedPiece?.position} on ${piece.position}`)
        if (selectedPiece == null || CheckForPromotion(piece)) return;

        if (piece === selectedPiece) {
            addSelected(piece);
            return;
        }
        if (selectedPiece.availableMoves.includes(piece.position) || selectedPiece.availableCaptures.includes(piece.position)) {
            attack(piece);
            removeSelected();

        }
        return;
    };

    const handleOnClick = (clickedPiece: ChessPiece) => {
        console.log(clickedPiece)
        if (promotionInfo || chessGame?.gameDone) return;
        if (CheckForPromotion(clickedPiece)) return;

        if (selectedPiece === null) {
            addSelected(clickedPiece);
            return;
        }

        if (clickedPiece !== selectedPiece) {
            // if selected piece belongs to the active player, select it instead, else "attack" the square. 
            if (clickedPiece.isWhite === clickedPiece.isWhite) addSelected(clickedPiece);
            if (selectedPiece.availableMoves.includes(clickedPiece.position) ||
                selectedPiece.availableCaptures.includes(clickedPiece.position)) {
                attack(clickedPiece);
                removeSelected();
            }
            return;
        }

        removeSelected();
    }

    const whitesTurn = chessGame?.chessBoard.turn === "w";

    const addSelected = (selectedPiece: ChessPiece) => {
        if (selectedPiece.isWhite === (whitesTurn) && selectedPiece.type !== PieceType.Empty) {
            setSelectedPiece(selectedPiece);
        }
        else setSelectedPiece(null);
    };

    const removeSelected = () => {
        setSelectedPiece(null);
    };

    const CheckForPromotion = (clickedPiece: ChessPiece) => {
        if (selectedPiece === null || selectedPiece.type !== PieceType.Pawn) return false;

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
                promotion: PieceType.Queen
            });
            return true;
        }
        return false;
    }


    const pieceClass = `piece ${(user && activePlayer?.id == user.id && piece.isWhite === (activePlayer?.color === "w")) ? "currentTurn" : ""}`;

    const reversed = false;

    return (
        <div
            className={`square ${isLight ? "light" : "dark"} ${isSelected ? "selected" : ""}`}
            onClick={() => handleOnClick(piece)}
            onDragOver={dragOver}
            onDrop={() => onDrop(piece)}
        >
            {piece.type != PieceType.Empty &&
                <img
                    className={pieceClass}
                    alt=""
                    draggable={piece.isWhite === whitesTurn && !chessGame?.gameDone}
                    onDragStart={(e) => {
                        drag(e, piece);
                        addSelected(piece);
                    }}
                    onDragEnd={(e) => dragEnd(e, piece)}
                    src={`/chess_images/${color}-${piece.type}.png`}
                />}

            {isTarget && <div className='target'></div>}
            {isMove && <div className='move'></div>}

            {user && piece.position[0] === "h" && <div className='overlay-rank'>{piece.position[1]}</div>}
            {user && piece.position[1] === ((!reversed) ? "8" : "1") && <div className='overlay-file'>{piece.position[0]}</div>}
        </div>
    );
}

export default PieceDisplay;