import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import type { ChessGame, ChessPiece, ChessUser, PromotionInformation } from './ChessTypes';

type ChessBoardContextValue = {
    chessGame: ChessGame | null;
    selectedPiece: ChessPiece | null;
    promotionInfo: PromotionInformation | null;
    activePlayer: ChessUser | null;
    setActivePlayer: (activePlayer: ChessUser | null) => void;
    setPromotionInfo: (promotionInfo: PromotionInformation | null) => void;
    setSelectedPiece: (piece: ChessPiece | null) => void;
};

const ChessBoardContext = createContext<ChessBoardContextValue | undefined>(
    undefined
);

function useChessBoard() {
    const context = useContext(ChessBoardContext);
    if (context === undefined) {
        throw new Error('useChessBoard must be used within a ChessBoardProvider');
    }
    return context;
}

function ChessBoardProvider({ children }: { children: ReactNode }) {
    const [chessGame, setChessGame] = useState<ChessGame | null>(null);
    const [selectedPiece, setSelectedPiece] = useState<ChessPiece | null>(null);
    const [promotionInfo, setPromotionInfo] = useState<PromotionInformation | null>(null);
    const [activePlayer, setActivePlayer] = useState<ChessUser | null>(null);

    useEffect(() => {
        async function fetchBoard() {
            try {
                const res = await fetch('https://localhost:5270/api/Chess/1/board', {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!res.ok) {
                    throw new Error(`Failed to load board: ${res.status}`);
                }
                const json: ChessGame = await res.json();
                setChessGame(json);
                setActivePlayer(json.white)
            } catch (err) {
                console.error('Failed to fetch chess board:', err);
            }
        }
        fetchBoard();
    }, []);

    const value = useMemo<ChessBoardContextValue>(
        () => ({ chessGame, selectedPiece, setSelectedPiece, promotionInfo, setPromotionInfo, activePlayer, setActivePlayer }),
        [chessGame, selectedPiece]
    );

    return (
        <ChessBoardContext.Provider value={value}>
            {children}
        </ChessBoardContext.Provider>
    );
}

export { ChessBoardContext, useChessBoard };
export default ChessBoardProvider;
