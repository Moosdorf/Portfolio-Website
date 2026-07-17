// data/providers/ChessPuzzleProvider.tsx
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ChessBoardContext, type ChessBoardContextValue } from '../../components/Chess/ChessBoardContext';
import { ChessGameMode, type ChessGame, type ChessPiece, type ChessPuzzle, type PromotionInformation } from '../../components/Chess/ChessTypes';
import { useAuth } from '../../data/providers/AuthProvider';
import { ChessPuzzleContext } from '../../components/Chess/ChessPuzzleContext';

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
    const [isBlack, setIsBlack] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false); // user hit "reveal solution"

    const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

    const fetchNewPuzzle = useCallback(async () => {
        setIsFetching(true);
        try {
            const res = await fetch(`https://localhost:5270/api/puzzle/random`, { method: 'GET' });
            if (!res.ok) throw new Error(`Failed to load board: ${res.status}`);

            const puzzle: ChessPuzzle = await res.json();
            setChessPuzzle(puzzle);
            setIsRevealed(false);

            console.log(puzzle)
            const initialBoard = puzzle.ChessBoards[0];
            setIsBlack(!!user && initialBoard.Turn === 'b');

            const startingGame = {
                ChessBoard: initialBoard,
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

            setCurrentChessGame({ ...startingGame, ChessBoard: puzzle.ChessBoards[1] });
            setMoveIndex(1);

        } catch (err) {
            console.error('Failed to fetch chess board:', err);
            setIsFetching(false);
        }
    }, [user]);

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

        const afterUserIndex = startIndex + 1;
        setCurrentChessGame(prev =>
            prev ? { ...prev, ChessBoard: chessPuzzle.ChessBoards[afterUserIndex] } : prev
        );
        setMoveIndex(afterUserIndex);

        if (afterUserIndex < chessPuzzle.Moves.length) {
            await sleep(1000);
            const afterComputerIndex = afterUserIndex + 1;
            setCurrentChessGame(prev =>
                prev ? { ...prev, ChessBoard: chessPuzzle.ChessBoards[afterComputerIndex] } : prev
            );
            setMoveIndex(afterComputerIndex);
        }

        setIsMoving(false);
    }, [currentChessGame, chessPuzzle, selectedPiece, moveIndex, isMoving]);


    const revealSolution = useCallback(() => {
        if (!chessPuzzle) return;
        const finalIndex = chessPuzzle.ChessBoards.length - 1;
        setCurrentChessGame(prev =>
            prev ? { ...prev, ChessBoard: chessPuzzle.ChessBoards[finalIndex] } : prev
        );
        setMoveIndex(chessPuzzle.Moves.length);
        setSelectedPiece(null);
        setIsRevealed(true);
    }, [chessPuzzle]);

    const hintSquare = useMemo(() => {
        if (!chessPuzzle || isMoving) return null;
        const nextMove = chessPuzzle.Moves[moveIndex];
        return nextMove ? nextMove.split(',')[0] : null;
    }, [chessPuzzle, moveIndex, isMoving]);

    const isSolved = useMemo(
        () => !!chessPuzzle && moveIndex >= chessPuzzle.Moves.length && !isRevealed,
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
        gameMode: ChessGameMode.Puzzle,
        chessHistory: [],
        isMoving,
        isBlack,
        attack,
    }), [currentChessGame, selectedPiece, promotionInfo, isMoving, isBlack, attack, user]);

    return (
        <ChessPuzzleContext.Provider value={{
            currentPuzzle: chessPuzzle ?? null,
            fetchNewPuzzle,
            isFetching,
            hintSquare,
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