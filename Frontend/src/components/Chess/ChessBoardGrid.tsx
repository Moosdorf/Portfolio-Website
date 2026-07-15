// components/Chess/ChessBoardGrid.tsx
import { useChessBoard } from './ChessBoardContext';
import PieceDisplay from './PieceDisplay';

function ChessBoardGrid() {
    const { chessGame } = useChessBoard();
    if (!chessGame) return null;

    return (
        <div className="wrapper" style={{ position: "relative" }}>
            <div className="chessboard">
                {chessGame.ChessBoard.GameBoard.map((rank, rankIndex) =>
                    rank.map((piece, colIndex) => (
                        <div
                            key={piece.Position}
                            className={`square ${(rankIndex + colIndex) % 2 === 0 ? "light" : "dark"}`}
                        >
                            <PieceDisplay piece={piece} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ChessBoardGrid;