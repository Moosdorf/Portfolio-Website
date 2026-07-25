import { createContext, useContext } from 'react';
import type { ChessPuzzle, ChessPuzzleResult } from './ChessTypes';
import type { PuzzleMode } from '../../data/providers/ChessPuzzleProvider';



export type ChessPuzzleContextValue = {
    currentPuzzle: ChessPuzzle | null;
    fetchRandomPuzzle: () => Promise<void>;
    fetchRankedPuzzle: () => Promise<void>;
    isFetchingRandom: boolean;
    isFetchingRanked: boolean;
    getHint: () => void;
    hint: string[];
    currentHintSquare: string | null;
    revealSolution: () => void;
    isRevealed: boolean;
    isSolved: boolean;
    puzzleMode: PuzzleMode;
    chessPuzzleResult: ChessPuzzleResult | null;
    wrongMoveMade: boolean;
    invalidMoves: string[];
};

export const ChessPuzzleContext = createContext<ChessPuzzleContextValue | undefined>(undefined);

export function useChessPuzzle() {
    const context = useContext(ChessPuzzleContext);
    if (context === undefined) {
        throw new Error('useChessPuzzle must be used within a ChessPuzzleProvider');
    }
    return context;
}