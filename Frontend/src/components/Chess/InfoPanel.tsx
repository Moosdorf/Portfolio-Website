// InfoPanel.tsx
import { useChessBoard } from './ChessBoardContext';

interface InfoPanelProps {
    title: string;
    children: React.ReactNode;
    /** extra status states beyond check/checkmate, e.g. puzzle solved/revealed */
    extraStatus?: { condition: boolean; className: string; label: string }[];
}

function InfoPanel({ title, children, extraStatus = [] }: InfoPanelProps) {
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
                    {extraStatus.find(s => s.condition) && (
                        <p className={`status-line ${extraStatus.find(s => s.condition)!.className}`}>
                            {extraStatus.find(s => s.condition)!.label}
                        </p>
                    )}
                </span>
            </div>

            {children}
        </div>
    );
}

export default InfoPanel;