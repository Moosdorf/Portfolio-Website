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
  Empty: 0,
  Pawn: 1,
  Knight: 2,
  Bishop: 3,
  Rook: 4,
  Queen: 5,
  King: 6,
} as const;

export type PieceType = (typeof PieceType)[keyof typeof PieceType];

/* promotions */
export const PromotionType = {
  Knight: 2,
  Bishop: 3,
  Rook: 4,
  Queen: 5,
}
export type PromotionType = (typeof PromotionType)[keyof typeof PromotionType];


export interface PromotionSquare {
  position: string;
  promotionType: PromotionType;
}

export type PromotionInformation = {
    from: ChessPiece,
    to: ChessPiece,
    promotion: PromotionType
};


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
  fen: string;
  inCheck: boolean;
  checkedKing: ChessPiece | null;
  lastMove: string;
  /** 8x8 grid, [rank][file] */
  gameBoard: ChessPiece[][];
  blackPieces: ChessPiece[];
  whitePieces: ChessPiece[];
  blackKing: ChessPiece;
  whiteKing: ChessPiece;
  blockers: Square[];
}

// --- Users & game wrapper ---------------------------------------------
export interface ChessUser {
  id: number;
  username: string;
  white: boolean;
}

export interface ChessGame {
  id: number;
  white: ChessUser;
  whiteId: number;
  black: ChessUser;
  blackId: number;
  moves: number;
  fenList: string[];
  gameStarted: string; // ISO 8601 timestamp
  currentState: string;
  chessBoard: ChessBoard;
  gameDone: boolean;
}


