// --- Primitives ------------------------------------------------------

/** Algebraic notation, e.g. "e4". */
export type Square = string;

/** Single-character side-to-move indicator. */
export type Color = "w" | "b";

/**
 * Numeric piece codes as sent by the backend.
 * Verified against the sample data: pawn=1, knight=2, bishop=3, rook=4,
 * queen=5, king=6, empty square=0.
 */
export const PieceType = {
  empty: 0,
  pawn: 1,
  knight: 2,
  bishop: 3,
  rook: 4,
  queen: 5,
  king: 6,
} as const;

export type PieceType = (typeof PieceType)[keyof typeof PieceType];

// --- promotions ------------------------------------------------------------
export const PromotionType = {
  knight: 2,
  bishop: 3,
  rook: 4,
  queen: 5,
}
export type PromotionType = (typeof PromotionType)[keyof typeof PromotionType];


export interface PromotionSquare {
  position: string;
  promotionType: PromotionType;
}

export type PromotionInformation = {
    from: ChessPiece;
    to: ChessPiece;
    options: PromotionSquare[]; 
};


// --- game modes ------------------------------------------------------------
export const ChessGameMode = {
  none: "None",
  multiplayer: "Multiplayer",
  bot: "Bot",
  puzzle: "Puzzle",
  freeplay: "Freeplay"
} as const;

export type ChessGameMode = (typeof ChessGameMode)[keyof typeof ChessGameMode];

export type Project = {
    title: string,
    description: string,
    id: number
}

export type SelectedGameOptions = {
    gameMode: ChessGameMode,
    selectedColor: string,
    username: string
}

// --- Pieces ------------------------------------------------------------
export interface ChessPiece {
  type: PieceType;
  position: Square;
  isWhite: boolean;
  pinned: boolean;
  pinnedSquares: Square[];
  availableMoves: Square[];
  availableCaptures: Square[];
  attackers: Square[];
  defenders: Square[];
}

// --- Board -----------------------------------------------------------
export interface ChessBoard {
  turn: Color;
  castling: string; // e.g. "KQkq", or "-" once all rights are lost
  enPassantSquare: Square; // "-" when not applicable
  halfMoveNumber: number;
  fullMoveClock: number;
  fEN: string;

  inCheck: boolean;
  checkedKing: ChessPiece | null;
  lastMove: string;
  checkMate: boolean;
  winner: string | null;

  /** 8x8 grid, [rank][file] */
  gameBoard: ChessPiece[][];
  blackPieces: ChessPiece[];
  whitePieces: ChessPiece[];
  blackKing: ChessPiece;
  whiteKing: ChessPiece;
  blockers: Square[];
}
// --- Puzzles -----------
export interface ChessPuzzle {
  chessBoard: ChessBoard;
  chessBoards: ChessBoard[];
  fEN: string;
  gameUrl: string;
  moves: string[];
  nbPlays: number
  openingTags: string[]
  popularity: number
  puzzleId: string
  rating: number
  ratingDeviation: number
  tags: string[]
}



// --- Users & game wrapper ---------------------------------------------
export interface ChessMove {
  chessGameId: number;
  moveString: string;
  fEN: string;
}


export interface ChessGame {
  id: number;
  sessionId: string;

  chessBoard: ChessBoard;

  gameType: string;

  players: string[];

  moves: ChessMove[];
  fenList: string[];

  gameStarted: string; // ISO 8601 timestamp
}


