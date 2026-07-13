import { Link } from 'react-router-dom';
import { useAuth } from '../../data/providers/AuthProvider';
import { useChessBoard } from './ChessBoard';
import { PieceType, type ChessPiece } from './ChessTypes';
import PieceDisplay from './PieceDisplay';

// props for component

function ChessBoardDisplay() {
    const { user } = useAuth();
    const { chessGame, chessHistory } = useChessBoard();

    if (user) {
        if (!chessGame) return <p>Loading...</p>;
        const { GameBoard } = chessGame.ChessBoard;

    
        return (
            <div className="board-layout">
                <div className="fake-info-panel">
                </div>
                <div className="wrapper" style={{ position: 'relative' }}>
                    <div className="chessboard">
                        {GameBoard.map((rank) =>
                            rank.map((piece) => (
                                <PieceDisplay key={piece.Position} piece={piece} />
                            ))
                        )}
                    </div>
                </div>

                <div className="info-panel border">
                    <h2>Game Info</h2>
                    <h5>Game mode: {chessGame.GameType}</h5>
                    <h5>Game ID: {chessGame.Id}</h5>
                    <h6>Black player: {chessGame.Players[1]}</h6>
                    <h6>White player: {chessGame.Players[0]}</h6>
                    <div className="move-history border">
                        {chessHistory?.map((game, i) => (
                        <div
                            key={i}
                            className={`history-row ${i === chessHistory.length - 1 ? 'current' : ''}`}
                        >
                            <span className="move-number">{i + 1}</span>
                            <span>{game.FEN}</span>
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
                        Type: PieceType.Empty,
                        Position: `${String.fromCharCode(97 + (rank))}${(file+1)}`,
                        IsWhite: true,
                        Pinned: false,
                        PinnedSquares: [],
                        AvailableMoves: [],
                        AvailableCaptures: [],
                        Attackers: [],
                        Defenders: [],
                })
            }   
        }

        return (
            <div className="wrapper" style={{ position: 'relative' }}>
                <div className="chessboard">
                    {storeEmpties.map((piece) => (
                        <PieceDisplay key={piece.Position} piece={piece} />
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