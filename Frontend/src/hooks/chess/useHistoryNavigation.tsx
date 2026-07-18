import { useCallback, useState } from 'react';
import type { ChessBoard } from '../../components/Chess/ChessTypes';

export function useHistoryNavigation(chessHistory: ChessBoard[], liveBoard: ChessBoard | null) {
    const [viewIndex, setViewIndex] = useState<number | null>(null);

    const goToPrevious = useCallback(() => {
        setViewIndex(i => {
            const current = i ?? chessHistory.length - 1; // set to i, or latest state
            return Math.max(0, current - 1);
        });
    }, [chessHistory.length]);

    const goToNext = useCallback(() => {
        setViewIndex(i => {
            if (i === null) return null; 
            const next = i + 1;
            return next >= chessHistory.length - 1 ? null : next;
        });
    }, [chessHistory.length]);

    const goToCurrent = useCallback(() => setViewIndex(null), []);

    const snapToLive = useCallback(() => setViewIndex(null), []);

    const isViewingHistory = viewIndex !== null && viewIndex !== chessHistory.length - 1;
    const displayedBoard = viewIndex !== null ? (chessHistory[viewIndex] ?? liveBoard) : liveBoard;

    return {
        viewIndex,
        setViewIndex,
        goToPrevious,
        goToNext,
        goToCurrent,
        snapToLive,
        isViewingHistory,
        displayedBoard,
    };
}