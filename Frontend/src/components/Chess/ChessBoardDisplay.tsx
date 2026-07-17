import { Link } from 'react-router-dom';
import { useAuth } from '../../data/providers/AuthProvider';
import { PieceType, type ChessPiece } from './ChessTypes';
import PieceDisplay from './PieceDisplay';
import { useChessBoard } from './ChessBoardContext';
import ChessBoardGrid from './ChessBoardGrid';

// props for component

function  ChessBoardDisplay() {
    const { user } = useAuth();
    const { chessGame, chessHistory } = useChessBoard();

    if (user) {
        if (!chessGame) return <p>Loading...</p>;
        const { gameBoard, turn } = chessGame.chessBoard;

        const isUserWhite = chessGame.players[0] === user.username; // adjust property if needed

        const topPlayer = isUserWhite
            ? chessGame.players[1]
            : chessGame.players[0];

        const bottomPlayer = isUserWhite
            ? chessGame.players[0]
            : chessGame.players[1];

        const topTurn = isUserWhite ? "b" : "w";
        const bottomTurn = isUserWhite ? "w" : "b";
        
        return (
            <div className="board-layout">
                <div className="fake-info-panel"></div>

                <div className="board-column">   
                    {/* Opponent */}
                    <div className={`player-bar ${turn === topTurn ? "active" : ""}`}>
                        <span className="player-name">
                            {topPlayer || "Waiting for opponent…"}
                        </span>
                    </div>

                    {/* Chessboard */}
                    <ChessBoardGrid/>

                    {/* You */}
                    <div className={`player-bar ${turn === bottomTurn ? "active" : ""}`}>
                        <span className="player-name">{bottomPlayer}</span>
                    </div>
                </div>

                <div className="info-panel border">
                    <h2>Game Info</h2>

                    {chessGame.chessBoard.checkMate ? (
                        <p className="status-line status-checkmate">
                            Checkmate: {chessGame.chessBoard.winner} wins
                        </p>
                    ) : chessGame.chessBoard.inCheck ? (
                        <p className="status-line status-check">Check</p>
                    ) : null}

                    <h5>Game mode: {chessGame.gameType}</h5>
                    <h5>Move: {chessGame.chessBoard.fullMoveClock}</h5>
                    {chessGame.chessBoard.lastMove && <h5>Last move: {chessGame.chessBoard.lastMove}</h5>}

                    <p className="game-id">Game ID: {chessGame.id}</p>

                    <div className="move-history border">
                        {chessHistory?.map((game, i) => (
                            <div key={i} className={`history-row ${i === chessHistory.length - 1 ? 'current' : ''}`}>
                                <span className="move-number">{i + 1}</span>
                                <span>{game.fEN}</span>
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
                    type: PieceType.empty,
                    position: `${String.fromCharCode(97 + (rank))}${(file + 1)}`,
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