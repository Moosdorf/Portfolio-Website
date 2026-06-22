import { Link } from 'react-router-dom';
import { useAuth } from '../../data/providers/AuthProvider';
import { useChessBoard } from './ChessBoard';
import { ChessGameMode, PieceType, type ChessPiece } from './ChessTypes';
import PieceDisplay from './PieceDisplay';

// props for component
interface ChessBoardDisplayProps {
  gameMode: ChessGameMode;
}

function ChessBoardDisplay({ gameMode }: ChessBoardDisplayProps) {
    const { user } = useAuth();
    const { chessGame, chessHistory } = useChessBoard();



    if (user) {
        if (!chessGame) return <p>Loading...</p>;
        const { gameBoard } = chessGame.chessBoard;

        return (
            <div className="board-layout">
                <div className="fake-info-panel">
                </div>
                <div className="wrapper" style={{ position: 'relative' }}>
                    <div className="chessboard">
                        {gameBoard.map((rank) =>
                            rank.map((piece) => (
                                <PieceDisplay key={piece.position} piece={piece} />
                            ))
                        )}
                    </div>
                </div>

                <div className="info-panel border">
                    <h2>Game Info</h2>
                    <h5>Game mode: {gameMode}</h5>
                    <h5>Game ID: {chessGame.id}</h5>
                    <h6>Black player: {chessGame.black.username}</h6>
                    <h6>White player: {chessGame.white.username}</h6>
                    <div className="move-history border">
                        {chessHistory?.map((game, i) => (
                        <div
                            key={i}
                            className={`history-row ${i === chessHistory.length - 1 ? 'current' : ''}`}
                        >
                            <span className="move-number">{i + 1}</span>
                            <span>{game.fen}</span>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    } else { // NO USER
        let storeEmpties: ChessPiece[] = []
        for (let rank = 0; rank < 8; rank++) {
                for (let file = 0; file < 8; file++) {
                    storeEmpties.push ({
                        type: PieceType.Empty,
                        position: `${String.fromCharCode(97 + (rank))}${(file+1)}`,
                        isWhite: true,
                        pinned: false,
                        pinnedSquares: [],
                        availableMoves: [],
                        availableCaptures: [],
                        attackers: [],
                        defenders: [],
                })
            }   
        }

        return (
            <div className="wrapper" style={{ position: 'relative' }}>
                <div className="chessboard">
                    {storeEmpties.map((piece) => (
                        <PieceDisplay key={piece.position} piece={piece} />
                    ))}
                </div>

                <div className="board-overlay">
                    <Link to={"/account"} className="overlay-link">
                        Create an account or login to play chess.
                    </Link>
                </div>
            </div>
        );
    }    
}

export default ChessBoardDisplay;