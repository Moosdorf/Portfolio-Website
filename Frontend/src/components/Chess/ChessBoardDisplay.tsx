import { Link } from 'react-router-dom';
import { useAuth } from '../../data/providers/AuthProvider';
import { PieceType, type ChessPiece } from './ChessTypes';
import PieceDisplay from './PieceDisplay';
import { useChessBoard } from './ChessBoardContext';
import ChessBoardGrid from './ChessBoardGrid';

// props for component

function ChessBoardDisplay() {
    const { user } = useAuth();
    const { chessGame, chessHistory } = useChessBoard();

    if (user) {
        if (!chessGame) return <p>Loading...</p>;
        const { GameBoard, Turn } = chessGame.ChessBoard;

        const isUserWhite = chessGame.Players[0] === user.username; // adjust property if needed

        const topPlayer = isUserWhite
            ? chessGame.Players[1]
            : chessGame.Players[0];

        const bottomPlayer = isUserWhite
            ? chessGame.Players[0]
            : chessGame.Players[1];

        const topTurn = isUserWhite ? "b" : "w";
        const bottomTurn = isUserWhite ? "w" : "b";
        
        return (
            <div className="board-layout">
                <div className="fake-info-panel"></div>

                <div className="board-column">   
                    {/* Opponent */}
                    <div className={`player-bar ${Turn === topTurn ? "active" : ""}`}>
                        <span className="player-name">
                            {topPlayer || "Waiting for opponent…"}
                        </span>
                    </div>

                    {/* Chessboard */}
                    <ChessBoardGrid/>

                    {/* You */}
                    <div className={`player-bar ${Turn === bottomTurn ? "active" : ""}`}>
                        <span className="player-name">{bottomPlayer}</span>
                    </div>
                </div>

                <div className="info-panel border">
                    <h2>Game Info</h2>

                    {chessGame.ChessBoard.CheckMate ? (
                        <p className="status-line status-checkmate">
                            Checkmate: {chessGame.ChessBoard.Winner} wins
                        </p>
                    ) : chessGame.ChessBoard.InCheck ? (
                        <p className="status-line status-check">Check</p>
                    ) : null}

                    <h5>Game mode: {chessGame.GameType}</h5>
                    <h5>Move: {chessGame.ChessBoard.FullMoveClock}</h5>
                    {chessGame.ChessBoard.LastMove && <h5>Last move: {chessGame.ChessBoard.LastMove}</h5>}

                    <p className="game-id">Game ID: {chessGame.Id}</p>

                    <div className="move-history border">
                        {chessHistory?.map((game, i) => (
                            <div key={i} className={`history-row ${i === chessHistory.length - 1 ? 'current' : ''}`}>
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
                storeEmpties.push({
                    Type: PieceType.Empty,
                    Position: `${String.fromCharCode(97 + (rank))}${(file + 1)}`,
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