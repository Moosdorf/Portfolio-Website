// data/providers/ChessPuzzleProvider.tsx
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ChessBoardContext, type ChessBoardContextValue } from '../../components/Chess/ChessBoardContext';
import { ChessGameMode, type ChessGame, type ChessPiece, type ChessPuzzle, type PromotionInformation } from '../../components/Chess/ChessTypes';
import { useAuth } from '../../data/providers/AuthProvider';

type ChessPuzzleProviderProps = {
    children: ReactNode;
    initialGame: ChessGame;  
    puzzleId: string;       
    solutionMoves: string[];  
};

function ChessPuzzleProvider({ children, initialGame, puzzleId, solutionMoves }: ChessPuzzleProviderProps) {
    const { user } = useAuth();
    const [chessGame, setChessGame] = useState<ChessGame | null>(initialGame);
    const [selectedPiece, setSelectedPiece] = useState<ChessPiece | null>(null);
    const [promotionInfo, setPromotionInfo] = useState<PromotionInformation | null>(null);

    const [moveIndex, setMoveIndex] = useState(0);
    const [isMoving, setIsMoving] = useState(false);

    const attack = useCallback(async (clickedPiece: ChessPiece) => {
        if (!chessGame || !selectedPiece || isMoving) return;

        const attempted = `${selectedPiece.Position},${clickedPiece.Position}`;
        const expected = solutionMoves[moveIndex];

        if (attempted !== expected) {
            setSelectedPiece(null);
            return;
        }

        const previousGame = chessGame;
        setIsMoving(true);
        setSelectedPiece(null);

        try {
            const res = await fetch(`https://localhost:5270/api/puzzle/move`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Move: attempted,
                    PuzzleId: puzzleId,
                    FEN: chessGame.ChessBoard.FEN
                }),
            });

            if (!res.ok) {
                throw new Error(`Failed to submit puzzle move: ${res.status}`);
            }

            const puzzle: ChessPuzzle = await res.json();
            const newGame = {
                ChessBoard: puzzle.ChessBoard,
                Id: -1,
                SessionId: "",
                GameType: "Puzzle",
                Players: [puzzle.ChessBoard.Turn == "w" ? user.username : "puzzle", puzzle.ChessBoard.Turn == "b" ? user.username : "puzzle"],
                Moves: [],
                FenList: [puzzle.FEN],
                GameStarted: "",
            } satisfies ChessGame;
            setChessGame(newGame);
            setMoveIndex(i => i + 1);
        } catch (err) {
            console.error('Move failed, rolling back:', err);
            setChessGame(previousGame);
        } finally {
            setIsMoving(false);
        }
    }, [chessGame, selectedPiece, moveIndex, isMoving, solutionMoves, puzzleId, user]);

    const value = useMemo<ChessBoardContextValue>(() => ({
        chessGame,
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
    }), [chessGame, selectedPiece, promotionInfo, isMoving, attack, user]);

    return (
        <ChessBoardContext.Provider value={value}>
            {children}
        </ChessBoardContext.Provider>
    );
}

export default ChessPuzzleProvider;
