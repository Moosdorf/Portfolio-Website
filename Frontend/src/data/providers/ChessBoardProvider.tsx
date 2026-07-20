import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { ChessGameMode, type ChessBoard, type ChessGame, type ChessPiece, type PromotionInformation, type PromotionSquare, type PromotionType, type SelectedGameOptions } from '../../components/Chess/ChessTypes';
import { PieceType } from '../../components/Chess/ChessTypes';
import { ChessBoardContext, type ChessBoardContextValue } from '../../components/Chess/ChessBoardContext';
import { useAuth } from './AuthProvider';
import * as signalR from '@microsoft/signalr';
import { useHistoryNavigation } from '../../hooks/chess/useHistoryNavigation';
import { API_URL } from '../../config';
import { api } from '../../api/client';


type ChessBoardProviderProps = {
    children: ReactNode;
    selectedGameOptions: SelectedGameOptions;
    gameId?: string;
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
    gameId 
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

        console.log("game")
        console.log(game)
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
        const conn = new signalR.HubConnectionBuilder()
            .withUrl(`${API_URL}/hubs/chess`, { withCredentials: true })
            .withAutomaticReconnect()
            .build();

        conn.on('BoardUpdated', (game: ChessGame) => {
            handleSetChessGame(game);
        });

        conn.start().catch(err => console.error('SignalR connection error:', err));
        setConnection(conn);

        return () => {
            conn.stop();
        };
    }, [handleSetChessGame]); // connection lifecycle only which is set up once

    useEffect(() => {
        if (!connection || connection.state !== signalR.HubConnectionState.Connected || !chessGame?.id) return;

        connection.invoke('JoinGame', chessGame.id.toString()).catch(err => console.error('JoinGame failed:', err));

        return () => {
            connection.invoke('LeaveGame', chessGame.id.toString()).catch(() => {});
        };
    }, [connection, chessGame?.id]);

    useEffect(() => {
        async function loadOrCreateGame() {
            try {
                if (!user) return;

                if (gameId) {
                    const game = await api.get<ChessGame>(`/api/chess/${gameId}`, {
                        credentials: 'include',
                    });
                    handleSetChessGame(game);
                    return;
                }

                let path = selectedGameOptions.gameMode == "Puzzle" ? `/api/Chess/puzzle` :
                    selectedGameOptions.gameMode == "Freeplay" ?      `/api/Chess/freeplay` :
                    selectedGameOptions.gameMode == "Multiplayer" ?   `/api/Chess/multiplayer` :
                                                            `/api/Chess/bot`; // bot

                let body: Record<string, unknown> = {};
                switch (selectedGameOptions?.gameMode) {
                    case ChessGameMode.puzzle:
                    case ChessGameMode.bot: {
                        if (selectedGameOptions?.selectedColor === "white") {
                            body = {
                                GameMode: selectedGameOptions?.gameMode,
                                BlackId: -1,
                                WhiteId: user.id
                            };
                        } else {
                            body = {
                                GameMode: selectedGameOptions?.gameMode,
                                WhiteId: -1,
                                BlackId: user.id
                            };
                        }
                        break;
                    }

                    case ChessGameMode.freeplay: {
                        body = {
                            GameMode: selectedGameOptions?.gameMode,
                            WhiteId: user.id,
                            BlackId: user.id
                        };
                    }
                }

                const game = await api.post<ChessGame>(path, body, { credentials: 'include' });
                handleSetChessGame(game);

            } catch (err) {
                console.error('Failed to fetch chess board:', err);
            }
        }
        loadOrCreateGame();
    }, [gameId, selectedGameOptions?.gameMode, user, handleSetChessGame, selectedGameOptions]);

    // attack
    const attack = useCallback(async (clickedPiece: ChessPiece, promotion: PromotionType | null = null) => {
        if (chessGame === null || selectedPiece === null || clickedPiece === null || isMoving) return;

        if (promotion)
            console.log("promotion")
        
        const previousGame = chessGame;
        const optimisticGame = buildOptimisticGame(chessGame, selectedPiece, clickedPiece);

        setIsMoving(true);
        setChessGame(optimisticGame);
        setSelectedPiece(null);

        let path = chessGame.gameType == "Puzzle" ? `/api/Chess/${chessGame?.id}/move` :
                    chessGame.gameType == "Freeplay" ? `/api/Chess/${chessGame?.id}/move` :
                    chessGame.gameType == "Multiplayer" ? `/api/Chess/${chessGame?.id}/move` :
                                                    `/api/Chess/bot/${chessGame?.id}/move`; // bot
        try {
            const game = await api.put<ChessGame>(path, {
                Move: `${selectedPiece?.position},${clickedPiece.position}${(promotion == 5) ? "q" : (promotion == 4) ? "r" : (promotion == 3) ? "b" : (promotion == 2) ? "n" : ""}`,
                User: user?.username,
                GameId: chessGame?.id
            }, { credentials: 'include' });

            handleSetChessGame(game);
        } catch (err) {
            console.error('Move failed, rolling back:', err);
            setChessGame(previousGame);
            setIsMoving(false);
        }

    }, [chessGame, selectedPiece, user, isMoving, handleSetChessGame]);

    const choosePromotion = (promoSquare: PromotionSquare) => {
        if (!promotionInfo) return;
        attack(promotionInfo.to, promoSquare.promotionType);
        setPromotionInfo(null);
        setSelectedPiece(null);
    };

    // context value
    const value = useMemo<ChessBoardContextValue>(
        () => ({
            choosePromotion,
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
