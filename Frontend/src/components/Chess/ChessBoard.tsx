import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import type { ChessBoard, ChessGame, ChessPiece, PromotionInformation, SelectedGameOptions } from './ChessTypes';
import { ChessGameMode, PieceType } from './ChessTypes';
import { useAuth } from '../../data/providers/AuthProvider';

type ChessBoardContextValue = {
    chessGame: ChessGame | null;
    selectedPiece: ChessPiece | null;
    promotionInfo: PromotionInformation | null;
    activePlayer: string | null;
    gameMode: ChessGameMode | null;
    chessHistory: ChessBoard[];
    attack: (clickedPiece: ChessPiece) => void;
    setActivePlayer: (activePlayer: string | null) => void;
    setPromotionInfo: (promotionInfo: PromotionInformation | null) => void;
    setSelectedPiece: (piece: ChessPiece | null) => void;
    selectedGameOptions: SelectedGameOptions;
};

type ChessBoardProviderProps = {
    children: ReactNode;
    selectedGameOptions: SelectedGameOptions;
};

const ChessBoardContext = createContext<ChessBoardContextValue | undefined>(
    undefined
);

function useChessBoard() {
    const context = useContext(ChessBoardContext);
    if (context === undefined) {
        throw new Error('useChessBoard must be used within a ChessBoardProvider');
    }
    return context;
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
    const { user } = useAuth();
    
    const handleSetChessGame = (game: ChessGame) => {
        if (game === null) return;
        if (user.username == game.Players[0]) game.ChessBoard.GameBoard = game?.ChessBoard.GameBoard.reverse();

        if (game?.ChessBoard.Turn == "w") {
            setActivePlayer(game.Players[0]);
        } else {
            setActivePlayer(game.Players[1]);
        }

        setChessGame(game);
    };

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
    }, [selectedGameOptions?.GameMode]);

    const attack = useCallback(async (clickedPiece: ChessPiece) => {
        if (chessGame === null || selectedPiece === null || clickedPiece === null) return;

        chessGame.ChessBoard.GameBoard.reverse();

        chessGame.ChessBoard.GameBoard[parseInt(selectedPiece.Position[1]) - 1][selectedPiece.Position.charCodeAt(0) - 97] = {
            Type: PieceType.Empty,
            Position: selectedPiece.Position,
            IsWhite: false,
            Pinned: false,
            PinnedSquares: [],
            AvailableMoves: [],
            AvailableCaptures: [],
            Attackers: [],
            Defenders: []
        };
        chessGame.ChessBoard.GameBoard[parseInt(clickedPiece.Position[1]) - 1][clickedPiece.Position.charCodeAt(0) - 97] = selectedPiece;
        chessGame.ChessBoard.Turn = chessGame.ChessBoard.Turn === "w" ? "b" : "w";
        handleSetChessGame(chessGame);


        const res = await fetch(`https://localhost:5270/api/Chess/${chessGame?.Id}/move`, {
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

    }, [chessGame, selectedPiece, user]);

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
            attack,
            selectedGameOptions,
        }),
        [chessGame, selectedPiece, promotionInfo, activePlayer, chessHistory, attack, selectedGameOptions]
    );

    return (
        <ChessBoardContext.Provider value={value}>
            {children}
        </ChessBoardContext.Provider>
    );
}

export { ChessBoardContext, useChessBoard };
export default ChessBoardProvider;