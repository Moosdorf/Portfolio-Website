import { useChessBoard } from './ChessBoardContext';
import type { PromotionType } from './ChessTypes';

function PromotionBox() {
    const { promotionInfo, setPromotionInfo, attack } = useChessBoard();

    if (!promotionInfo) return null;

    const handlePick = (promotionType: PromotionType) => {
        attack(promotionInfo.to, promotionType); 
        setPromotionInfo(null); 
    };

    const isWhite = promotionInfo.from.isWhite;

    return (
        <div className="promotion-overlay" onClick={() => setPromotionInfo(null)}>
            <div className="promotion-picker" onClick={e => e.stopPropagation()}>
                {promotionInfo.options.map(option => (
                    <button
                        key={option.promotionType}
                        className="promotion-choice"
                        onClick={() => handlePick(option.promotionType)}
                    >
                        <img
                            alt={"option.promotionType"}
                            src={`/chess_images/${isWhite ? "white" : "black"}-${option.promotionType}.png`}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}

export default PromotionBox;