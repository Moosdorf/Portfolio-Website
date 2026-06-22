import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import type { ChessBoard, ChessGame, ChessPiece, ChessUser, PromotionInformation } from './ChessTypes';
import { ChessGameMode } from './ChessTypes';
import { useAuth } from '../../data/providers/AuthProvider';
import { jsx } from 'react/jsx-runtime';

type ChessBoardContextValue = {
    chessGame: ChessGame | null;
    selectedPiece: ChessPiece | null;
    promotionInfo: PromotionInformation | null;
    activePlayer: ChessUser | null;
    gameMode: ChessGameMode | null;
    chessHistory: ChessBoard[];
    attack: (clickedPiece: ChessPiece) => void;
    setActivePlayer: (activePlayer: ChessUser | null) => void;
    setPromotionInfo: (promotionInfo: PromotionInformation | null) => void;
    setSelectedPiece: (piece: ChessPiece | null) => void;
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
    gameMode,
    }: {
        children: ReactNode;
        gameMode: ChessGameMode | null;
    }) {
    const [chessGame, setChessGame] = useState<ChessGame | null>(null);
    const [chessHistory, setChessHistory] = useState<ChessBoard[]>([]);
    const [selectedPiece, setSelectedPiece] = useState<ChessPiece | null>(null);
    const [promotionInfo, setPromotionInfo] = useState<PromotionInformation | null>(null);
    const [activePlayer, setActivePlayer] = useState<ChessUser | null>(null);
    const { user } = useAuth();
    const [chessUser, setChessUser] = useState<ChessUser | null>(null); 
    const [gameId, setGameId] = useState(-1); 

    

    useEffect(() => {
        async function createNewGame() {
            try {
                if (!user) return;

                const res = await fetch(`https://localhost:5270/api/Chess/create/`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        GameType: gameMode,
                        BlackId: -1,
                        WhiteId: user.id
                    }),
                });
                if (!res.ok) {
                    throw new Error(`Failed to load board: ${res.status}`);
                }

                const json: ChessGame = await res.json();
                setGameId(json.gameId);
                console.log(json)
            } catch (err) {
                console.error('Failed to fetch chess board:', err);
            }
        }
        createNewGame();
    }, [gameMode]);

    useEffect(() => {
        async function fetchBoard() {
            if (!user) return;
            console.log("fetching board", gameId)
            try {
                if (!gameId || gameId === -1) return;
                
                const res = await fetch(`https://localhost:5270/api/Chess/${gameId}/board`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!res.ok) {
                    throw new Error(`Failed to load board: ${res.status}`);
                }

                const json: ChessGame = await res.json();

                if (json.blackId == user.id) {
                    setChessUser(json.black)
                } else setChessUser(json.white)
                
                console.log("reverse")
                if (user.id == json.whiteId) json?.chessBoard.gameBoard.reverse();

                setChessGame(json);

                if (chessGame?.chessBoard.turn == "w") {
                    setActivePlayer({
                          id: json.whiteId,
                          username: json.white.username,
                          color: "w"
                    })
                } else setActivePlayer({
                        id: json.whiteId,
                        username: json.white.username,
                        color: "w"
                    })

            } catch (err) {
                console.error('Failed to fetch chess board:', err);
            }
        }
        fetchBoard();
    }, [gameId]);


    const attack = async (clickedPiece: ChessPiece) => {
        console.log
        console.log("Attack!")
        console.log(clickedPiece)
        console.log(chessGame)
        const res = await fetch(`https://localhost:5270/api/Chess/${chessGame?.id}/move`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        Move: `${selectedPiece?.position},${clickedPiece.position}`
                    }),
                });

        if (!res.ok) {
            throw new Error(`Failed to load board: ${res.status}`);
        }
        const json: {result: {game: ChessGame, successful: boolean}} = await res.json();

        console.log(json.result);
        
        
        
        
    }

    const value = useMemo<ChessBoardContextValue>(
        () => ({ chessGame, selectedPiece, setSelectedPiece, promotionInfo, setPromotionInfo, activePlayer, setActivePlayer, gameMode, chessHistory, attack }),
        [chessGame, selectedPiece]
    );

    return (
        <ChessBoardContext.Provider value={value}>
            {children}
        </ChessBoardContext.Provider>
    );
}

export { ChessBoardContext, useChessBoard };
export default ChessBoardProvider;
