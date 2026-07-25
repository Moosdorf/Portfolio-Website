import { useChessBoard } from './ChessBoardContext';

interface PuzzleInfoPanelProps {
    title: string;
    children: React.ReactNode;
    extraStatus?: { condition: boolean; className: string; label: string }[];
    invalidMoves?: string[];
}

function PuzzleInfoPanel({ title, children, extraStatus = [], invalidMoves = [] }: PuzzleInfoPanelProps) {
    const { chessGame } = useChessBoard();
    if (!chessGame) return null;

    const { checkMate, inCheck, winner } = chessGame.chessBoard;

    return (
        <div className="info-panel border">
            <h2 className="puzzle-info-heading">{title}</h2>
            <div className="status-slot">
                <span className="status-left">
                    {checkMate ? (
                        <p className="status-line status-checkmate">
                            Checkmate: {winner} wins
                        </p>
                    ) : inCheck ? (
                        <p className="status-line status-check">Check</p>
                    ) : null}
                </span>

                <span className="status-right">
                    {extraStatus
                        .filter(s => s.condition)
                        .map(s => (
                            <p key={s.label} className={`status-line ${s.className}`}>
                                {s.label}
                            </p>
                        ))}
                </span>
            </div>

            {children}

            {invalidMoves.length > 0 && (
                <div className="invalid-moves-section">
                    <h5 className="invalid-moves-heading">Incorrect attempts</h5>
                    <div className="invalid-moves-list">
                        {invalidMoves.map((move, i) => (
                            <span key={`${move}-${i}`} className="invalid-move-pill">
                                {move.replace(',', ' → ')}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default PuzzleInfoPanel;