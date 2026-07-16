import { useAuth } from '../../data/providers/AuthProvider';
import { useChessBoard } from './ChessBoardContext';
import PieceDisplay from './PieceDisplay';

const FILES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8']; 

function ChessBoardGrid() {
    const { chessGame } = useChessBoard();
    const { user } = useAuth();
    if (!chessGame) return null;

    console.log(user)
    console.log(chessGame.Players)
    let isBlack = user.username === chessGame.Players[1];

    const displayBoard = isBlack
        ? chessGame.ChessBoard.GameBoard.map(row => [...row].reverse())
        : [...chessGame.ChessBoard.GameBoard].reverse();

    const displayRanks = isBlack ? RANKS : [...RANKS].reverse();
    const displayFiles = isBlack ? [...FILES].reverse() : FILES;

    return (
        <div className="wrapper">
            <div className="board-with-labels">
                <div className="rank-labels">
                    {displayRanks.map((r) => (
                        <div key={r} className="rank-label">{r}</div>
                    ))}
                </div>

                <div className="chessboard">
                    {displayBoard.map((rank, rankIndex) =>
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

                <div className="corner-spacer" />

                <div className="file-labels">
                    {displayFiles.map((f) => (
                        <div key={f} className="file-label">{f}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ChessBoardGrid;