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

type ChessBoardProviderProps = {
    children: ReactNode;
    selectedGameOptions: SelectedGameOptions;
};



function buildOptimisticGame(game: ChessGame, from: ChessPiece, to: ChessPiece): ChessGame {
    const newBoard = game.ChessBoard.GameBoard.map(rank => rank.map(p => ({ ...p })));

    const findCell = (pos: string) => {
        for (const rank of newBoard) {
            const cell = rank.find(p => p.Position === pos);
            if (cell) return cell;
        }
        return null;
    };

    const fromCell = findCell(from.Position);
    const toCell = findCell(to.Position);
    if (!fromCell || !toCell) return game;

    toCell.Type = fromCell.Type;
    toCell.IsWhite = fromCell.IsWhite;
    toCell.AvailableMoves = [];
    toCell.AvailableCaptures = [];
    toCell.Attackers = [];
    toCell.Defenders = [];
    toCell.Pinned = false;
    toCell.PinnedSquares = [];

    fromCell.Type = PieceType.Empty;
    fromCell.AvailableMoves = [];
    fromCell.AvailableCaptures = [];
    fromCell.Attackers = [];
    fromCell.Defenders = [];
    fromCell.Pinned = false;
    fromCell.PinnedSquares = [];

    const newTurn = game.ChessBoard.Turn === 'w' ? 'b' : 'w';

    return {
        ...game,
        ChessBoard: {
            ...game.ChessBoard,
            GameBoard: newBoard,
            Turn: newTurn,
            LastMove: `${from.Position}-${to.Position}`,
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

    // update chess game
    const handleSetChessGame = useCallback((game: ChessGame) => {
        if (game === null) return;
        if (user && user.username === game.Players[0]) {
            game.ChessBoard.GameBoard = game.ChessBoard.GameBoard.slice().reverse();
        }

        if (game?.ChessBoard.Turn === "w") {
            setActivePlayer(game.Players[0]);
        } else {
            setActivePlayer(game.Players[1]);
        }

        setChessGame(game);
        setIsMoving(false);
        console.log("Setting chess game:", game);
    }, [user]);

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
            .then(() => conn.invoke('JoinGame', chessGame?.Id.toString()))
            .catch(err => console.error('SignalR connection error:', err));

        setConnection(conn);
        console.log(conn)

        return () => {
            conn.invoke('LeaveGame', chessGame?.Id.toString()).catch(() => {});
            conn.stop();
        };
    }, [chessGame?.Id, handleSetChessGame]);

    // create new game
    useEffect(() => {
        async function createNewGame() {
            try {
                console.log("Creating new game with options:", selectedGameOptions);
                if (!user) return;

                let body = JSON.stringify({})
                console.log(selectedGameOptions?.SelectedColor)
                if (selectedGameOptions?.SelectedColor === "white") {
                    body = JSON.stringify({
                        GameMode: selectedGameOptions?.GameMode,
                        BlackId: -1,
                        WhiteId: user.id
                    });
                } else {
                    body = JSON.stringify({
                        GameMode: selectedGameOptions?.GameMode,
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
    }, [selectedGameOptions?.GameMode, user, handleSetChessGame, selectedGameOptions]);

    // attack
    const attack = useCallback(async (clickedPiece: ChessPiece) => {
        if (chessGame === null || selectedPiece === null || clickedPiece === null || isMoving) return;

        const previousGame = chessGame;
        const optimisticGame = buildOptimisticGame(chessGame, selectedPiece, clickedPiece);

        setIsMoving(true);
        setChessGame(optimisticGame);
        setSelectedPiece(null);

        let path = chessGame.GameType == "Puzzle" ? `https://localhost:5270/api/Chess/${chessGame?.Id}/move` :
                    chessGame.GameType == "Freeplay" ? `https://localhost:5270/api/Chess/${chessGame?.Id}/move` :
                    chessGame.GameType == "Multiplayer" ? `https://localhost:5270/api/Chess/${chessGame?.Id}/move` :
                                                    `https://localhost:5270/api/Chess/bot/${chessGame?.Id}/move`; // bot
        try {
            const res = await fetch(path, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Move: `${selectedPiece?.Position},${clickedPiece.Position}`,
                    User: user?.username,
                    GameId: chessGame?.Id,
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
            gameMode: selectedGameOptions?.GameMode || null,
            chessHistory,
            isMoving,
            attack,
            selectedGameOptions,
        }),
        [chessGame, selectedPiece, promotionInfo, activePlayer, chessHistory, isMoving, attack, selectedGameOptions]
    );

    return (
        <ChessBoardContext.Provider value={value}>
            {children}
        </ChessBoardContext.Provider>
    );
}

export default ChessBoardProvider;
