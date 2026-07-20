import { createContext, useContext } from 'react';
import type { ChessPuzzle } from './ChessTypes';

export type ChessPuzzleContextValue = {
    currentPuzzle: ChessPuzzle | null;
    fetchNewPuzzle: () => Promise<void>;
    isFetching: boolean;
    hint: string | null;
    getHint: () => void;
    revealSolution: () => void;
    isRevealed: boolean;
    isSolved: boolean;
};

export const ChessPuzzleContext = createContext<ChessPuzzleContextValue | undefined>(undefined);

export function useChessPuzzle() {
    const context = useContext(ChessPuzzleContext);
    if (context === undefined) {
        throw new Error('useChessPuzzle must be used within a ChessPuzzleProvider');
    }
    return context;
}