import { useAuth } from "../../data/providers/AuthProvider";
import { useChessBoard } from "./ChessBoardContext";
import { PieceType, type ChessPiece } from "./ChessTypes";
import PieceDisplay from "./PieceDisplay";

interface ChessSquareProps {
    piece: ChessPiece;
    rankIndex: number;
    colIndex: number;
}

function ChessSquare({ piece, rankIndex, colIndex }: ChessSquareProps) {
    const { displayedBoard, selectedPiece, activePlayer, isViewingHistory } = useChessBoard();
    const { user } = useAuth();

    const isSelected = piece === selectedPiece;
    const whitesTurn = displayedBoard?.turn === "w";
    const isCurrentTurn =
        !isViewingHistory && !!user && activePlayer === user.username;

    const isMove = !isViewingHistory && !!selectedPiece && selectedPiece.availableMoves.includes(piece.position);
    const isTarget = !isViewingHistory && !!selectedPiece && selectedPiece.availableCaptures.includes(piece.position);
    const color = piece.isWhite ? "white" : "black";

    let squareClass = `square ${(rankIndex + colIndex) % 2 === 0 ? "light" : "dark"}`;
    if (isSelected) squareClass += " selected";

    const lastMoves = displayedBoard?.lastMove.split(",");
    if (lastMoves && piece.position === lastMoves[1]) squareClass += " movedTo";
    if (lastMoves && piece.position === lastMoves[0]) squareClass += " movedFrom";

    if (piece.type === PieceType.king && piece.isWhite === whitesTurn) {
        if (displayedBoard?.inCheck) squareClass += " check";
        if (displayedBoard?.checkMate) squareClass += " checkmate";
    }

    const pieceClass = `piece${isCurrentTurn ? " currentTurn" : ""}`;

    return (
        <PieceDisplay
            piece={piece}
            squareClass={squareClass}
            pieceClass={pieceClass}
            color={color}
            isMove={isMove}
            isTarget={isTarget}
        />
    );
}

export default ChessSquare;