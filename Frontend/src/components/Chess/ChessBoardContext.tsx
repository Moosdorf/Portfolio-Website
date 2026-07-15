import { createContext, useContext } from 'react';
import type { ChessBoard, ChessGame, ChessPiece, PromotionInformation, SelectedGameOptions } from './ChessTypes';
import type { ChessGameMode } from './ChessTypes';

export type ChessBoardContextValue = {
    chessGame: ChessGame | null;
    selectedPiece: ChessPiece | null;
    promotionInfo: PromotionInformation | null;
    activePlayer: string | null;
    gameMode: ChessGameMode | null;
    chessHistory: ChessBoard[];
    isMoving: boolean;
    attack: (clickedPiece: ChessPiece) => void;
    setActivePlayer: (activePlayer: string | null) => void;
    setPromotionInfo: (promotionInfo: PromotionInformation | null) => void;
    setSelectedPiece: (piece: ChessPiece | null) => void;
    selectedGameOptions?: SelectedGameOptions;
};

export const ChessBoardContext = createContext<ChessBoardContextValue | undefined>(undefined);

export function useChessBoard() {
    const context = useContext(ChessBoardContext);
    if (context === undefined) {
        throw new Error('useChessBoard must be used within a ChessBoardProvider');
    }
    return context;
}