import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChessBoardContext, type ChessBoardContextValue } from '../../components/Chess/ChessBoardContext';
import { ChessGameMode, type ChessGame, type ChessPiece, type ChessPuzzle, type ChessPuzzleResult, type PromotionInformation, type PromotionSquare } from '../../components/Chess/ChessTypes';
import { useAuth } from '../../data/providers/AuthProvider';
import { ChessPuzzleContext } from '../../components/Chess/ChessPuzzleContext';
import { useHistoryNavigation } from '../../hooks/chess/useHistoryNavigation';
import { api } from '../../api/client';


type ChessPuzzleProviderProps = {
    children: ReactNode;
};

export type PuzzleMode = {
    puzzleType: PuzzleType
}
type PuzzleType = "random" | "ranked" | "none";

function ChessPuzzleProvider({ children }: ChessPuzzleProviderProps) {
    const { user, amILoggedIn } = useAuth();
    const [chessPuzzle, setChessPuzzle] = useState<ChessPuzzle | null>(null);
    const [currentChessGame, setCurrentChessGame] = useState<ChessGame | null>(null);
    const [selectedPiece, setSelectedPiece] = useState<ChessPiece | null>(null);
    const [promotionInfo, setPromotionInfo] = useState<PromotionInformation | null>(null);
    const [moveIndex, setMoveIndex] = useState(0);
    const [isMoving, setIsMoving] = useState(false);
    const [isFetchingRandom, setIsFetchingRandom] = useState(false);
    const [isFetchingRanked, setIsFetchingRanked] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);
    const [hint, setHint] = useState<string[]>([]);
    const [puzzleMode, setPuzzleMode] = useState<PuzzleMode>({puzzleType: "none"});
    const [chessPuzzleResult, setChessPuzzleResult] = useState<ChessPuzzleResult | null>(null);
    const [movesMade, setMovesMade] = useState<string[]>([])
    const [ratingChanged, setRatingChanged] = useState(0);
    const [hintActive, setHintActive] = useState(false);

    const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));


    const chessHistory = useMemo(
        () => chessPuzzle ? chessPuzzle.chessBoards.slice(0, moveIndex + 1) : [],
        [chessPuzzle, moveIndex]
    );



    const wrongMoveMade = movesMade.some(m => !chessPuzzle?.moves.includes(m)); 
    const invalidMoves = movesMade.filter(m => !chessPuzzle?.moves.includes(m))

    const resetStats = () => {
        setChessPuzzleResult(null)
        setMoveIndex(0)
        setSelectedPiece(null)
        setPromotionInfo(null)
        setIsMoving(false)
        setIsRevealed(false)
        setHintActive(false)
        setHint([])
        setMovesMade([])
        amILoggedIn();
    }

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
        setIsFetchingRandom(true);
        resetStats();
        try {

            let puzzle = await api.get<ChessPuzzle>('/api/puzzle/random', {
                credentials: 'include',
            });

            setPuzzleMode(prev => ({...prev, puzzleType: "random"}));

            setChessPuzzle(puzzle);
            setIsRevealed(false);
            setHint([]);
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
            setIsFetchingRandom(false);
            setMoveIndex(0);
            snapToLive();

            await sleep(1000);

            setCurrentChessGame({ ...startingGame, chessBoard: puzzle.chessBoards[1] });
            setMoveIndex(1);
            snapToLive();

        } catch (err) {
            console.error('Failed to fetch chess board:', err);
            setIsFetchingRandom(false);
        }
    }, [user, snapToLive]);

    const fetchRankedPuzzle = useCallback(async () => {
        setIsFetchingRanked(true);
        resetStats();
        try {
            let puzzle = await api.get<ChessPuzzle>('/api/puzzle/ranked', {
                credentials: 'include',
            });
            setPuzzleMode(prev => ({...prev, puzzleType: "ranked"}));

            setChessPuzzle(puzzle);
            setIsRevealed(false);
            setHint([]);
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
            setIsFetchingRanked(false);
            setMoveIndex(0);
            snapToLive();

            await sleep(1000);

            setCurrentChessGame({ ...startingGame, chessBoard: puzzle.chessBoards[1] });
            setMoveIndex(1);
            snapToLive();

        } catch (err) {
            console.error('Failed to fetch chess board:', err);
            setIsFetchingRanked(false);
        }
    }, [user, snapToLive]);

    const puzzleSolvedRequest = useCallback(async () => {
        if (!chessPuzzleResult) return;

        let puzzleSolvedResponse = await api.put<number>('/api/puzzle/ranked/result', chessPuzzleResult, {credentials: 'include'});
        console.log(puzzleSolvedResponse)

    }, [chessPuzzleResult])

    const isSolved = useMemo(
        () => !!chessPuzzle && moveIndex >= chessPuzzle.moves.length,
        [chessPuzzle, moveIndex]
    );

    const attack = useCallback(async (clickedPiece: ChessPiece, promotionType: number | null = null) => {

        // check if piece can move
        if (isSolved || isViewingHistory || !currentChessGame || !chessPuzzle || !selectedPiece || isMoving) {
            setSelectedPiece(null);
            return;
        }

        // check if attempted move is the correct solution
        const attempted = `${selectedPiece?.position},${clickedPiece.position}${(promotionType == 5) ? "q" : (promotionType == 4) ? "r" : (promotionType == 3) ? "b" : (promotionType == 2) ? "n" : ""}`;
        const expected = chessPuzzle.moves[moveIndex];

        setMovesMade((prev) => [...prev, attempted])

        if (attempted !== expected) {
            setSelectedPiece(null); // incorrect move, deselect piece
            return;
        }
 
        // correct move, set moving to true and deselect the piece 
        setIsMoving(true);
        setHintActive(false);
        setSelectedPiece(null);


        // update chess state
        const afterPlayerIndex = moveIndex + 1;
        setCurrentChessGame(prev =>
            prev ? { ...prev, chessBoard: chessPuzzle.chessBoards[afterPlayerIndex] } : prev
        );
        setMoveIndex(afterPlayerIndex);
        snapToLive();

        // update chess state again, to reflect the other side moving.
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

    
    useEffect(() => {
        if (!chessPuzzle || chessPuzzleResult) return; // if already sent request, dont do it again
        if (isSolved || wrongMoveMade || hint.length > 0 || isRevealed) { // if puzzle is solved, a wrong move is made or a hint/reveal is used, send a request
            setChessPuzzleResult({
                puzzleId: chessPuzzle.puzzleId,
                movesMade: movesMade,
                hintUsed: hint.length > 0,
                puzzleRevealed: isRevealed
            })
        }

    }, [isSolved, chessPuzzle, movesMade, hint, isRevealed, chessPuzzleResult])


    useEffect(() => {
        if (chessPuzzleResult && puzzleMode.puzzleType === "ranked") {
            puzzleSolvedRequest();
        }
    }, [chessPuzzleResult, puzzleMode, puzzleSolvedRequest]);

    const revealSolution = useCallback(() => {
        if (!chessPuzzle) return;
        const finalIndex = chessPuzzle.chessBoards.length - 1;
        setCurrentChessGame(prev =>
            prev ? { ...prev, chessBoard: chessPuzzle.chessBoards[finalIndex] } : prev
        );
        setMoveIndex(chessPuzzle.moves.length);
        setSelectedPiece(null);
        setIsRevealed(true);
        setHintActive(false);
        snapToLive();
    }, [chessPuzzle, snapToLive]);

    const hintSquare = useMemo(() => {
        if (!chessPuzzle || isMoving) return null;
        const nextMove = chessPuzzle.moves[moveIndex];
        return nextMove ? nextMove.split(',')[0] : null;
    }, [chessPuzzle, moveIndex, isMoving]);

    const getHint = useCallback(() => {
        if (hintSquare) {
            console.log("hint is: " + hintSquare)
            setHintActive(true);
            setHint((prev) => [...prev, hintSquare]);
        }
    }, [hintSquare]);

    const currentHintSquare = hintActive ? hintSquare : null;

    const choosePromotion = (promoSquare: PromotionSquare) => {
        if (!promotionInfo) return;
        attack(promotionInfo.to, promoSquare.promotionType);
        setPromotionInfo(null);
        setSelectedPiece(null);
    };



    const value = useMemo<ChessBoardContextValue>(() => ({
        choosePromotion,
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
            fetchRandomPuzzle: fetchNewPuzzle,
            fetchRankedPuzzle,
            isFetchingRandom: isFetchingRandom,
            isFetchingRanked: isFetchingRanked,
            getHint,
            hint: hint,
            currentHintSquare,
            revealSolution,
            isRevealed: isRevealed,
            isSolved: isSolved,
            chessPuzzleResult: chessPuzzleResult,
            puzzleMode: puzzleMode,
            wrongMoveMade: wrongMoveMade,
            invalidMoves: invalidMoves
        }}>
            <ChessBoardContext.Provider value={value}>
                {children}
            </ChessBoardContext.Provider>
        </ChessPuzzleContext.Provider>
    );
}

export default ChessPuzzleProvider;