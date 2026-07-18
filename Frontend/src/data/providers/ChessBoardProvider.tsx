import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import type { ChessBoard, ChessGame, ChessPiece, PromotionInformation, SelectedGameOptions } from '../../components/Chess/ChessTypes';
import { PieceType } from '../../components/Chess/ChessTypes';
import { ChessBoardContext, type ChessBoardContextValue } from '../../components/Chess/ChessBoardContext';
import { useAuth } from './AuthProvider';
import * as signalR from '@microsoft/signalr';
import { useHistoryNavigation } from '../../hooks/chess/useHistoryNavigation';

type ChessBoardProviderProps = {
    children: ReactNode;
    selectedGameOptions: SelectedGameOptions;
};



function buildOptimisticGame(game: ChessGame, from: ChessPiece, to: ChessPiece): ChessGame {
    const newBoard = game.chessBoard.gameBoard.map(rank => rank.map(p => ({ ...p })));

    const findCell = (pos: string) => {
        for (const rank of newBoard) {
            const cell = rank.find(p => p.position === pos);
            if (cell) return cell;
        }
        return null;
    };

    const fromCell = findCell(from.position);
    const toCell = findCell(to.position);
    if (!fromCell || !toCell) return game;

    toCell.type = fromCell.type;
    toCell.isWhite = fromCell.isWhite;
    toCell.availableMoves = [];
    toCell.availableCaptures = [];
    toCell.attackers = [];
    toCell.defenders = [];
    toCell.pinned = false;
    toCell.pinnedSquares = [];

    fromCell.type = PieceType.empty;
    fromCell.availableMoves = [];
    fromCell.availableCaptures = [];
    fromCell.attackers = [];
    fromCell.defenders = [];
    fromCell.pinned = false;
    fromCell.pinnedSquares = [];

    const newTurn = game.chessBoard.turn === 'w' ? 'b' : 'w';

    return {
        ...game,
        chessBoard: {
            ...game.chessBoard,
            gameBoard: newBoard,
            turn: newTurn,
            lastMove: `${from.position},${to.position}`,
            inCheck: false,
            checkMate: false
        },
    };
}

function ChessBoardProvider({
    children,
    selectedGameOptions,
}: ChessBoardProviderProps) {
    const [chessGame, setChessGame] = useState<ChessGame | null>(null);
    const [chessHistory, setChessHistory] = useState<ChessBoard[]>([]);
    const [selectedPiece, setSelectedPiece] = useState<ChessPiece | null>(null);
    const [promotionInfo, setPromotionInfo] = useState<PromotionInformation | null>(null);
    const [activePlayer, setActivePlayer] = useState<string | null>(null);
    const [isMoving, setIsMoving] = useState(false);
    const { user } = useAuth();
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

    const {
        viewIndex,
        setViewIndex,
        goToPrevious,
        goToNext,
        goToCurrent,
        snapToLive,
        isViewingHistory,
        displayedBoard,
    } = useHistoryNavigation(chessHistory, chessGame?.chessBoard ?? null);

    // update chess game
    const handleSetChessGame = useCallback((game: ChessGame) => {
        if (game === null) return;

        if (game?.chessBoard.turn === "w") {
            setActivePlayer(game.players[0]);
        } else {
            setActivePlayer(game.players[1]);
        }

        setChessGame(game);
        setChessHistory(prev => [...prev, game.chessBoard]);
        setIsMoving(false);
        snapToLive();  // if viewing history, go to live game
    }, [user, snapToLive]);

    // signal r
    useEffect(() => {
        console.log("signalr")
        const conn = new signalR.HubConnectionBuilder()
            .withUrl('https://localhost:5270/hubs/chess', { withCredentials: true })
            .withAutomaticReconnect()
            .build();

        conn.on('BoardUpdated', (game: ChessGame) => {
            console.log("update???")
            console.log(game)
            handleSetChessGame(game);
        });

        conn.start()
            .then(() => conn.invoke('JoinGame', chessGame?.id.toString()))
            .catch(err => console.error('SignalR connection error:', err));

        setConnection(conn);
        console.log(conn)

        return () => {
            conn.invoke('LeaveGame', chessGame?.id.toString()).catch(() => {});
            conn.stop();
        };
    }, [chessGame?.id, handleSetChessGame]);

    // create new game
    useEffect(() => {
        async function createNewGame() {
            try {
                console.log("Creating new game with options:", selectedGameOptions);
                if (!user) return;

                let body = JSON.stringify({})
                console.log(selectedGameOptions?.selectedColor)
                if (selectedGameOptions?.selectedColor === "white") {
                    body = JSON.stringify({
                        GameMode: selectedGameOptions?.gameMode,
                        BlackId: -1,
                        WhiteId: user.id
                    });
                } else {
                    body = JSON.stringify({
                        GameMode: selectedGameOptions?.gameMode,
                        WhiteId: -1,
                        BlackId: user.id
                    });
                }

                const res = await fetch(`https://localhost:5270/api/Chess/new/`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: body,
                });
                if (!res.ok) {
                    throw new Error(`Failed to load board: ${res.status}`);
                }

                const game: ChessGame = await res.json();
                handleSetChessGame(game);

            } catch (err) {
                console.error('Failed to fetch chess board:', err);
            }
        }
        createNewGame();
    }, [selectedGameOptions?.gameMode, user, handleSetChessGame, selectedGameOptions]);

    // attack
    const attack = useCallback(async (clickedPiece: ChessPiece) => {
        if (chessGame === null || selectedPiece === null || clickedPiece === null || isMoving) return;

        const previousGame = chessGame;
        const optimisticGame = buildOptimisticGame(chessGame, selectedPiece, clickedPiece);

        setIsMoving(true);
        setChessGame(optimisticGame);
        setSelectedPiece(null);

        let path = chessGame.gameType == "Puzzle" ? `https://localhost:5270/api/Chess/${chessGame?.id}/move` :
                    chessGame.gameType == "Freeplay" ? `https://localhost:5270/api/Chess/${chessGame?.id}/move` :
                    chessGame.gameType == "Multiplayer" ? `https://localhost:5270/api/Chess/${chessGame?.id}/move` :
                                                    `https://localhost:5270/api/Chess/bot/${chessGame?.id}/move`; // bot
        try {
            const res = await fetch(path, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Move: `${selectedPiece?.position},${clickedPiece.position}`,
                    User: user?.username,
                    GameId: chessGame?.id,
                    Promotion: null
                }),
            });

            if (!res.ok) {
                throw new Error(`Failed to load board: ${res.status}`);
            }

            const game: ChessGame = await res.json();
            handleSetChessGame(game);
        } catch (err) {
            console.error('Move failed, rolling back:', err);
            setChessGame(previousGame);
            setIsMoving(false);
        }

    }, [chessGame, selectedPiece, user, isMoving, handleSetChessGame]);

    // context value
    const value = useMemo<ChessBoardContextValue>(
        () => ({
            chessGame,
            selectedPiece,
            setSelectedPiece,
            promotionInfo,
            setPromotionInfo,
            activePlayer,
            setActivePlayer,
            gameMode: selectedGameOptions?.gameMode || null,
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
            selectedGameOptions,
        }),
        [chessGame, selectedPiece, promotionInfo, activePlayer, chessHistory, viewIndex,
        setViewIndex, goToPrevious, goToNext, goToCurrent, isViewingHistory, displayedBoard,
        isMoving, attack, selectedGameOptions]
    );

    return (
        <ChessBoardContext.Provider value={value}>
            {children}
        </ChessBoardContext.Provider>
    );
}

export default ChessBoardProvider;
