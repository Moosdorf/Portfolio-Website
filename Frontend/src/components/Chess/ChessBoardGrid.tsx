import { useAuth } from '../../data/providers/AuthProvider';
import { useChessBoard } from './ChessBoardContext';
import ChessSquare from './ChessSquare';

const FILES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];

function ChessBoardGrid() {
    const { chessGame, displayedBoard } = useChessBoard();
    const { user } = useAuth();
    if (!chessGame || !displayedBoard) return null;

    let isBlack = user.username === chessGame.players[1]; // orientation never flips mid-history-browse

    const displayBoard = isBlack 
        ? displayedBoard.gameBoard.map(row => [...row].reverse())
        : [...displayedBoard.gameBoard].reverse();

    const displayRanks = isBlack ? RANKS : [...RANKS].reverse();
    const displayFiles = isBlack ? [...FILES].reverse() : FILES;

    return (
        <div className="wrapper">
            <div className="board-with-labels">
                <div className="rank-labels">
                    {displayRanks.map((r) => <div key={r} className="rank-label">{r}</div>)}
                </div>

                <div className="chessboard">
                    {displayBoard.map((rank, rankIndex) =>
                        rank.map((piece, colIndex) => (
                            <ChessSquare key={piece.position} piece={piece} rankIndex={rankIndex} colIndex={colIndex} />
                        ))
                    )}
                </div>

                <div className="corner-spacer" />
                <div className="file-labels">
                    {displayFiles.map((f) => <div key={f} className="file-label">{f}</div>)}
                </div>
            </div>
        </div>
    );
}

export default ChessBoardGrid;