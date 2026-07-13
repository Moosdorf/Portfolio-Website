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

// --- promotions ------------------------------------------------------------
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


// --- game modes ------------------------------------------------------------
export const ChessGameMode = {
  None: "None",
  Multiplayer: "Multiplayer",
  Bot: "Bot",
  Puzzle: "Puzzle",
  Freeplay: "Freeplay"
} as const;

export type ChessGameMode = (typeof ChessGameMode)[keyof typeof ChessGameMode];

export type Project = {
    title: string,
    description: string,
    id: number
}

export type SelectedGameOptions = {
    GameMode: ChessGameMode,
    SelectedColor: string,
    Username: string
}

// --- Pieces ------------------------------------------------------------
export interface ChessPiece {
  Type: PieceType;
  Position: Square;
  IsWhite: boolean;
  Pinned: boolean;
  PinnedSquares: Square[];
  AvailableMoves: Square[];
  AvailableCaptures: Square[];
  Attackers: Square[];
  Defenders: Square[];
}

// --- Board -----------------------------------------------------------
export interface ChessBoard {
  Turn: Color;
  Castling: string; // e.g. "KQkq", or "-" once all rights are lost
  EnPassantSquare: Square; // "-" when not applicable
  HalfMoveNumber: number;
  FullMoveClock: number;
  FEN: string;

  InCheck: boolean;
  CheckedKing: ChessPiece | null;
  LastMove: string;
  CheckMate: boolean;
  Winner: string | null;

  /** 8x8 grid, [rank][file] */
  GameBoard: ChessPiece[][];
  BlackPieces: ChessPiece[];
  WhitePieces: ChessPiece[];
  BlackKing: ChessPiece;
  WhiteKing: ChessPiece;
  Blockers: Square[];
}

// --- Users & game wrapper ---------------------------------------------
export interface ChessMove {
  ChessGameId: number;
  MoveString: string;
  FEN: string;
}


export interface ChessGame {
  Id: number;
  SessionId: string;

  ChessBoard: ChessBoard;

  GameType: number;

  Players: string[];

  Moves: ChessMove[];
  FenList: string[];

  GameStarted: string; // ISO 8601 timestamp
}


