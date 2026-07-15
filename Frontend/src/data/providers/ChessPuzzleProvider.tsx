// data/providers/ChessPuzzleProvider.tsx
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChessBoardContext, type ChessBoardContextValue } from '../../components/Chess/ChessBoardContext';
import { ChessGameMode, type ChessGame, type ChessPiece, type ChessPuzzle, type PromotionInformation } from '../../components/Chess/ChessTypes';
import { useAuth } from '../../data/providers/AuthProvider';
import { ChessPuzzleContext } from '../../components/Chess/ChessPuzzleContext';

type Board = ChessPuzzle['ChessBoards'][number];

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

    // Whether the user is playing black for the current puzzle.
    const userIsBlackRef = useRef(false);

    const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

    // Black: reverse rows (ranks). White: reverse cols (files) within each row.
    const orient = useCallback((board: Board): Board => {
        return userIsBlackRef.current
            ? { ...board, GameBoard: board.GameBoard.slice().reverse() }
            : { ...board, GameBoard: board.GameBoard.map(row => row.slice().reverse()) };
    }, []);

    const fetchNewPuzzle = useCallback(async () => {
        setIsFetching(true);
        try {
            const res = await fetch(`https://localhost:5270/api/puzzle/random`, { method: 'GET' });
            if (!res.ok) throw new Error(`Failed to load board: ${res.status}`);

            const puzzle: ChessPuzzle = await res.json();
            setChessPuzzle(puzzle);

            const initialBoard = puzzle.ChessBoards[0];
            const userIsBlack = !!user && initialBoard.Turn === 'b';
            userIsBlackRef.current = userIsBlack;

            const startingGame = {
                ChessBoard: orient(initialBoard),
                Id: -1,
                SessionId: "",
                GameType: "Puzzle",
                Players: [
                    initialBoard.Turn === "b" ? user.username : "puzzle",
                    initialBoard.Turn === "w" ? user.username : "puzzle",
                ],
                Moves: [],
                FenList: [puzzle.FEN],
                GameStarted: "",
            } satisfies ChessGame;

            setCurrentChessGame(startingGame);
            setMoveIndex(0);
            setIsFetching(false);

            await sleep(1000);

            // reveal step: boards[0] -> boards[1]
            const revealedGame = { ...startingGame, ChessBoard: orient(puzzle.ChessBoards[1]) };
            setCurrentChessGame(revealedGame);
            setMoveIndex(1);

        } catch (err) {
            console.error('Failed to fetch chess board:', err);
            setIsFetching(false);
        }
    }, [user, orient]);

    const attack = useCallback(async (clickedPiece: ChessPiece) => {
        if (!currentChessGame || !chessPuzzle || !selectedPiece || isMoving) return;

        const attempted = `${selectedPiece.Position},${clickedPiece.Position}`;
        const startIndex = moveIndex;
        const expected = chessPuzzle.Moves[startIndex];

        if (attempted !== expected) {
            setSelectedPiece(null);
            return;
        }

        setIsMoving(true);
        setSelectedPiece(null);

        // 1. Show the result of the user's move immediately
        const afterUserIndex = startIndex + 1;
        setCurrentChessGame(prev =>
            prev ? { ...prev, ChessBoard: orient(chessPuzzle.ChessBoards[afterUserIndex]) } : prev
        );
        setMoveIndex(afterUserIndex);

        // 2. If there's a computer reply queued up in the puzzle, play it after a delay
        if (afterUserIndex < chessPuzzle.Moves.length) {
            await sleep(1000);

            const afterComputerIndex = afterUserIndex + 1;
            setCurrentChessGame(prev =>
                prev ? { ...prev, ChessBoard: orient(chessPuzzle.ChessBoards[afterComputerIndex]) } : prev
            );
            setMoveIndex(afterComputerIndex);
        }

        setIsMoving(false);
    }, [currentChessGame, chessPuzzle, selectedPiece, moveIndex, isMoving, orient]);

    const value = useMemo<ChessBoardContextValue>(() => ({
        chessGame: currentChessGame ?? null,
        selectedPiece,
        setSelectedPiece,
        promotionInfo,
        setPromotionInfo,
        activePlayer: user?.username ?? null,
        setActivePlayer: () => {},
        gameMode: ChessGameMode.Puzzle,
        chessHistory: [],
        isMoving,
        attack,
    }), [currentChessGame, selectedPiece, promotionInfo, isMoving, attack, user]);

    return (
        <ChessPuzzleContext.Provider value={{ currentPuzzle: chessPuzzle ?? null, fetchNewPuzzle, isFetching }}>
            <ChessBoardContext.Provider value={value}>
                {children}
            </ChessBoardContext.Provider>
        </ChessPuzzleContext.Provider>
    );
}

export default ChessPuzzleProvider;