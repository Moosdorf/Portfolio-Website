import { useEffect, useRef } from 'react';
import type { ChessBoard } from './ChessTypes';
import { Button } from '../Button';

interface MoveHistoryProps {
    chessHistory: ChessBoard[];
    viewIndex: number | null;
    isViewingHistory: boolean;
    setViewIndex: (index: number | null) => void;
    goToPrevious: () => void;
    goToNext: () => void;
    goToCurrent: () => void;
}

function MoveHistory({
    chessHistory,
    viewIndex,
    isViewingHistory,
    setViewIndex,
    goToPrevious,
    goToNext,
    goToCurrent,
}: MoveHistoryProps) {
    const currentRowRef = useRef<HTMLDivElement>(null);
    const currentIndex = viewIndex === null ? chessHistory.length - 1 : viewIndex;

    useEffect(() => {
        currentRowRef.current?.scrollIntoView({ block: 'nearest' });
    }, [currentIndex]);
    
    return (
        <>

            <div className="move-history border">
                {chessHistory?.map((board, i) => (
                    <div
                        key={i}
                        ref={i === currentIndex ? currentRowRef : null}
                        className={`history-row ${currentIndex === i ? 'current' : ''}`}
                        onClick={() => setViewIndex(i === chessHistory.length - 1 ? null : i)}
                    >
                        <span className="move-number">{i}.</span>
                        <span>{board.lastMove}</span>
                    </div>
                ))}
            </div>

                                
            <div className="history-nav">
                <Button variant='secondary' onClick={goToPrevious} disabled={viewIndex === 0}>{"<--"}</Button>
                <Button variant='secondary' onClick={goToCurrent} disabled={!isViewingHistory}>●</Button>
                <Button variant='secondary' onClick={goToNext} disabled={!isViewingHistory}>{"-->"}</Button>
            </div>
        </>
    );
}

export default MoveHistory;