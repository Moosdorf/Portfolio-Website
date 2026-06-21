import { useChessBoard } from './ChessBoard';
import PieceDisplay from './PieceDisplay';

function ChessBoardDisplay() {
    const { chessGame } = useChessBoard();
    if (!chessGame) return <p>Loading...</p>;
    const { gameBoard } = chessGame.chessBoard;

    return (
        <div className="wrapper">
            <div className="chessboard">
                {gameBoard.map((rank) =>
                    rank.map((piece) => (
                        <PieceDisplay key={piece.position} piece={piece} />
                    ))
                )}
            </div>
        </div>
    );
}

export default ChessBoardDisplay;