import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ChessBoardContext, type ChessBoardContextValue } from '../../components/Chess/ChessBoardContext';
import { ChessGameMode, type ChessGame, type ChessPiece, type ChessPuzzle, type PromotionInformation } from '../../components/Chess/ChessTypes';
import { useAuth } from '../../data/providers/AuthProvider';
import { ChessPuzzleContext } from '../../components/Chess/ChessPuzzleContext';
import { useHistoryNavigation } from '../../hooks/chess/useHistoryNavigation';


type ChessPuzzleProviderProps = {
    children: ReactNode;
};

function ChessPuzzleProvider({ children }: ChessPuzzleProviderProps) {
    const { user } = useAuth();
    const [chessPuzzle, setChessPuzzle] = useState<ChessPuzzle | null>(null);
    const [currentChessGame, setCurrentChessGame] = useState<ChessGame | null>(null);
    const [selectedPiece, setSelectedPiece] = useState<ChessPiece | null>(null);
    const [promotionInfo, setPromotionInfo] = useState<PromotionInformation | null>(null);
    const [moveIndex, setMoveIndex] = useState(0);
    const [isMoving, setIsMoving] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);
    const [hint, setHint] = useState<string | null>(null);

    const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

    // the "played so far" slice of the puzzle's full solution — this IS the puzzle's chessHistory
    const chessHistory = useMemo(
        () => chessPuzzle ? chessPuzzle.chessBoards.slice(0, moveIndex + 1) : [],
        [chessPuzzle, moveIndex]
    );

    const {
        viewIndex,
        setViewIndex,
        goToPrevious,
        goToNext,
        goToCurrent,
        snapToLive,
        isViewingHistory,
        displayedBoard,
    } = useHistoryNavigation(chessHistory, currentChessGame?.chessBoard ?? null);

    const fetchNewPuzzle = useCallback(async () => {
        setIsFetching(true);
        try {
            const res = await fetch(`https://localhost:5270/api/puzzle/random`, {
                method: 'GET',
                credentials: 'include'
             });
            if (!res.ok) throw new Error(`Failed to load board: ${res.status}`);

            const puzzle: ChessPuzzle = await res.json();
            setChessPuzzle(puzzle);
            setIsRevealed(false);
            setHint(null);
            console.log(puzzle)

            const initialBoard = puzzle.chessBoards[0];
            const username = user?.username ?? 'guest';

            const startingGame = {
                chessBoard: initialBoard,
                id: -1,
                sessionId: "",
                gameType: "Puzzle",
                players: [
                    initialBoard.turn === "b" ? username : "puzzle",
                    initialBoard.turn === "w" ? username : "puzzle",
                ],
                moves: [],
                fenList: [puzzle.fEN],
                gameStarted: "",
            } satisfies ChessGame;

            setCurrentChessGame(startingGame);
            setIsFetching(false);
            setMoveIndex(0);
            snapToLive();

            await sleep(1000);

            setCurrentChessGame({ ...startingGame, chessBoard: puzzle.chessBoards[1] });
            setMoveIndex(1);
            snapToLive();

        } catch (err) {
            console.error('Failed to fetch chess board:', err);
            setIsFetching(false);
        }
    }, [user, snapToLive]);

    const attack = useCallback(async (clickedPiece: ChessPiece) => {

        if (isSolved || isViewingHistory || !currentChessGame || !chessPuzzle || !selectedPiece || isMoving) {
            setSelectedPiece(null);
            return;
        }

        const attempted = `${selectedPiece.position},${clickedPiece.position}`;
        const expected = chessPuzzle.moves[moveIndex];

        if (attempted !== expected) {
            setSelectedPiece(null);
            return;
        }

        setIsMoving(true);
        setSelectedPiece(null);

        const afterPlayerIndex = moveIndex + 1;
        setCurrentChessGame(prev =>
            prev ? { ...prev, chessBoard: chessPuzzle.chessBoards[afterPlayerIndex] } : prev
        );
        setMoveIndex(afterPlayerIndex);
        snapToLive();

        let nextMoveIndex = afterPlayerIndex;

        if (afterPlayerIndex < chessPuzzle.moves.length) {
            await sleep(1000);
            const afterComputerIndex = afterPlayerIndex + 1;
            setCurrentChessGame(prev =>
                prev ? { ...prev, chessBoard: chessPuzzle.chessBoards[afterComputerIndex] } : prev
            );
            nextMoveIndex = afterComputerIndex;
            snapToLive();
        }

        setMoveIndex(nextMoveIndex);
        setIsMoving(false);
    }, [currentChessGame, chessPuzzle, selectedPiece, moveIndex, isMoving, isViewingHistory, snapToLive]);


    const revealSolution = useCallback(() => {
        if (!chessPuzzle) return;
        const finalIndex = chessPuzzle.chessBoards.length - 1;
        setCurrentChessGame(prev =>
            prev ? { ...prev, chessBoard: chessPuzzle.chessBoards[finalIndex] } : prev
        );
        setMoveIndex(chessPuzzle.moves.length);
        setSelectedPiece(null);
        setIsRevealed(true);
        snapToLive();
    }, [chessPuzzle, snapToLive]);

    const hintSquare = useMemo(() => {
        if (!chessPuzzle || isMoving) return null;
        const nextMove = chessPuzzle.moves[moveIndex];
        return nextMove ? nextMove.split(',')[0] : null;
    }, [chessPuzzle, moveIndex, isMoving]);

    const getHint = useCallback(() => {
        setHint(hintSquare);
    }, [hintSquare]);

    const isSolved = useMemo(
        () => !!chessPuzzle && moveIndex >= chessPuzzle.moves.length && !isRevealed,
        [chessPuzzle, moveIndex, isRevealed]
    );

    const value = useMemo<ChessBoardContextValue>(() => ({
        chessGame: currentChessGame ?? null,
        selectedPiece,
        setSelectedPiece,
        promotionInfo,
        setPromotionInfo,
        activePlayer: user?.username ?? null,
        setActivePlayer: () => {},
        gameMode: ChessGameMode.puzzle,
        chessHistory,
        viewIndex,
        setViewIndex,
        goToPrevious,
        goToNext,
        goToCurrent,
        isViewingHistory,
        displayedBoard,
        isMoving,
        attack,
    }), [
        currentChessGame, selectedPiece, promotionInfo, user, chessHistory, viewIndex,
        setViewIndex, goToPrevious, goToNext, goToCurrent, isViewingHistory, displayedBoard,
        isMoving, attack
    ]);

    return (
        <ChessPuzzleContext.Provider value={{
            currentPuzzle: chessPuzzle ?? null,
            fetchNewPuzzle,
            isFetching,
            hint,
            getHint,
            revealSolution,
            isRevealed,
            isSolved,
        }}>
            <ChessBoardContext.Provider value={value}>
                {children}
            </ChessBoardContext.Provider>
        </ChessPuzzleContext.Provider>
    );
}

export default ChessPuzzleProvider;