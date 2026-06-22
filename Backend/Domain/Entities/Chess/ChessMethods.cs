using Backend.Application.Chess.DTO;
using Backend.Domain.Entities.Chess;


namespace HelperMethods;

public static class ChessMethods
{

    /// <summary>
    /// Converts row and column indexes to a chessboard coordinate in file-rank format (e.g., 0,0 -> "a1").
    /// </summary>
    public static string RowColToRankFile(int row,
                                          int col)
    {
        char file = (char)(col + 97); // converting integer to char, just add 97 to find alphabet. 0 + 97 = 'a', 1 + 97 = 'b' and so on.
        int rank = row + 1; // create rank numbers (just increase by one)

        return $"{file}{rank}";
    }


    /// <summary>
    /// Converts a chessboard coordinate in file-rank format (e.g., "e4") to row and column indexes.
    /// </summary>
    /// <returns>A tuple with the corresponding row and col: (row, col).</returns>
    public static (int,int) RankFileToRowCol(string fileRank) // "e3" to 4,2
    {
        int row = fileRank[1] - 48 - 1; // '1' - 48 = 1. then to get index instead -1 again

        int col =  fileRank[0] - 97; // same as the other file conversion in RowCol, just reversed

        return (row, col);
    }

    /// <summary>
    /// Finds squares that block a check from a sliding piece (queen, rook, bishop) to the king.
    /// Adds these blocking squares to the chessState.Blockers list.
    /// </summary>
    public static void FindCheckBlockers(ChessBoard chessState, King king, Piece pieceChecked)
    {
        var blockers = new List<string>() { pieceChecked.Position };
        switch (pieceChecked.Type)
            {
                case PieceType.Queen:
                    blockers = blockers.Concat(DiagonalBlocks(chessState.GameBoard, king, pieceChecked)).ToList();
                    blockers = blockers.Concat(StraightBlocks(chessState.GameBoard, king, pieceChecked)).ToList();
                break;

                case PieceType.Rook:
                    blockers = blockers.Concat(StraightBlocks(chessState.GameBoard, king, pieceChecked)).ToList();
                break;

                case PieceType.Bishop:
                    blockers = blockers.Concat(DiagonalBlocks(chessState.GameBoard, king, pieceChecked)).ToList();
                break;
        }

        chessState.Blockers = chessState.Blockers.Concat(blockers).ToList();
    }

    /// <summary>
    /// Returns a list of squares between a diagonal attacker and the king that can potentially block a check.
    /// </summary>
    private static List<string> DiagonalBlocks(Piece[][] chessBoard, King king, Piece pieceChecked)
    {
        var blockers = new List<string>();
        (int aRow, int aCol) = RankFileToRowCol(pieceChecked.Position);
        (int kRow, int kCol) = RankFileToRowCol(king.Position);
        // check if they are diagonal to each other
        if (Math.Abs(aRow - kRow) != Math.Abs(aCol - kCol)) return blockers; // return empty list

        var verticalDirection = (aRow > kRow) ? -1 : 1; // true = king to the left of piece
        var horizontalDirection = (aCol > kCol) ? -1 : 1; // true = king "above" piece
        int distance = Math.Abs(aRow - kRow);

        for (int i = 1; i < distance; i++)
        {
            var square = chessBoard[aRow + i * verticalDirection][aCol + i * horizontalDirection];
            if (square.Type != PieceType.Empty) break;
            blockers.Add(square.Position);
        }

        // true true = up right
        // true false = up left
        // false true = down right
        // false false= down left

        return blockers;
    }

    /// <summary>
    /// Returns a list of squares between a straight-line attacker and the king that can potentially block a check.
    /// </summary>
    private static List<string> StraightBlocks(Piece[][] chessBoard, King king, Piece pieceChecked)
    {
        var blockers = new List<string>();
        (int aRow, int aCol) = RankFileToRowCol(pieceChecked.Position);
        (int kRow, int kCol) = RankFileToRowCol(king.Position);

        int deltaRow = 0, deltaCol = 0;
        int distance;

        if (aRow == kRow) // horizontal
        {
            distance = Math.Abs(aCol - kCol);
            deltaCol = (aCol > kCol) ? -1 : 1;
        }
        else if (aCol == kCol) // vertical
        {
            distance = Math.Abs(aRow - kRow);
            deltaRow = (aRow > kRow) ? -1 : 1;
        }
        else
        {
            return blockers; // Not in a straight line
        }

        for (int i = 1; i < distance; i++)
        {
            var square = chessBoard[aRow + i * deltaRow][aCol + i * deltaCol];
            if (square.Type != PieceType.Empty) break;
            blockers.Add(square.Position);
        }

        return blockers;
    }



    /// <summary>
    /// Converts a move string in the format "e2,e4" into row and column indices for from and to squares.
    /// </summary>
    public static (int fromRow, int fromCol, int toRow, int toCol) ConvertMoveToColRow(string move)
    {
        // move can be e2,e4. (from,to)
        var fromTo = move.Split(','); // split into [from, to]

        var from = fromTo[0];
        var to = fromTo[1];

        (int tRow, int tCol) = RankFileToRowCol(to); // convert to row,col to use as indexes
        (int fRow, int fCol) = RankFileToRowCol(from);

        return (fRow, fCol, tRow, tCol); // return all of the indexes
    }

    /// <summary>
    /// Executes a move on the chessboard, updating the chessState accordingly.
    /// Handles promotions, en passant, castling, and updating FEN related state.
    /// </summary>
    public static void MakeMove(ChessBoard chessState, MoveModel move)
    {

        var (fRow, fCol, tRow, tCol) = ConvertMoveToColRow(move.Move); // find indexes from the move

        // find target and attacker
        var target = chessState.GameBoard[tRow][tCol];
        var attacker = chessState.GameBoard[fRow][fCol];


        if (move.Promotion != null)
        {
            Piece promotionPiece = null;
            switch(move.Promotion)
            {
                
                case 'q': 
                    promotionPiece = new Queen(attacker.IsWhite) { Type = PieceType.Queen };
                    break;
                case 'r':
                    promotionPiece = new Rook(attacker.IsWhite) { Type = PieceType.Rook };
                    break;
                case 'b':
                    promotionPiece = new Bishop(attacker.IsWhite) { Type = PieceType.Bishop };
                    break;
                case 'k':
                    promotionPiece = new Knight(attacker.IsWhite) { Type = PieceType.Knight };
                    break;

            }
            chessState.GameBoard[tRow][tCol] = promotionPiece;
            var pieceList = (attacker.IsWhite) ? chessState.WhitePieces : chessState.BlackPieces;
            pieceList.Remove(attacker);
            pieceList.Add(promotionPiece);
        }
        else
        {
            // put attacker on target and update the position
            chessState.GameBoard[tRow][tCol] = attacker;
        }

        chessState.GameBoard[tRow][tCol].Position = RowColToRankFile(tRow, tCol);

        // en passant, remove the pawn that is below (or above depending on color)
        if (attacker.Type == PieceType.Pawn && target.Position == chessState.EnPassantSquare)
        {
            var rowRemove = (attacker.IsWhite) ? tRow - 1 : tRow + 1;
            chessState.GameBoard[rowRemove][tCol] = new Empty(false) { Type = PieceType.Empty, Position = RowColToRankFile(rowRemove, tCol) };

        }

        if (attacker.Type == PieceType.King && Math.Abs(fCol - tCol) == 2)
        {
            Rook rook;
            int rookCol = (tCol > fCol) ? tCol + 1 : tCol - 2;
            int rookToCol = (tCol > fCol) ? tCol - 1 : tCol + 1;
            rook = (Rook)chessState.GameBoard[fRow][rookCol];
            rook.Position = RowColToRankFile(fRow, rookToCol);


            chessState.GameBoard[fRow][rookToCol] = rook;
            chessState.GameBoard[fRow][rookCol] = new Empty(false) { Type = PieceType.Empty, Position = RowColToRankFile(fRow, rookCol) };
        }


        // replace the attackers square with a new empty piece
        chessState.GameBoard[fRow][fCol] = new Empty(false) { Type = PieceType.Empty, Position = RowColToRankFile(fRow, fCol) };


        UpdateFen(chessState, fRow, fCol, tRow, attacker);
    }

    /// <summary>
    /// Updates FEN-related state after a move, including en passant square, castling rights, move counters, and turn.
    /// </summary>
    private static void UpdateFen(ChessBoard chessState, int fRow, int fCol, int tRow, Piece attacker)
    {
        // update some FEN variables
        if (attacker.Type == PieceType.Pawn && Math.Abs(fRow - tRow) == 2)
        {
            chessState.EnPassantSquare = RowColToRankFile((attacker.IsWhite) ? fRow + 1 : fRow - 1, fCol);
        }
        else chessState.EnPassantSquare = "-";
        if (attacker.Type == PieceType.King)
        {
            if (attacker.IsWhite)
            {
                chessState.Castling = chessState.Castling.Replace("K", "");
                chessState.Castling = chessState.Castling.Replace("Q", "");
            }
            else
            {
                chessState.Castling = chessState.Castling.Replace("k", "");
                chessState.Castling = chessState.Castling.Replace("q", "");
            }
        }

        if (attacker.Type == PieceType.Rook)
        {
            if (chessState.Castling.Contains('K') && attacker.Position == "h1") chessState.Castling = chessState.Castling.Replace("K", "");
            if (chessState.Castling.Contains('Q') && attacker.Position == "a1") chessState.Castling = chessState.Castling.Replace("Q", "");
            if (chessState.Castling.Contains('k') && attacker.Position == "h8") chessState.Castling = chessState.Castling.Replace("k", "");
            if (chessState.Castling.Contains('q') && attacker.Position == "a8") chessState.Castling = chessState.Castling.Replace("q", "");
        }
        if (chessState.Castling == "") chessState.Castling = "-";

        // update some states like whose turn it is, incrementing variables
        chessState.Turn = (chessState.Turn == "w") ? "b" : "w";


        // reset halfmovenumber if pawn, else increment it
        if (attacker.Type == PieceType.Pawn) chessState.HalfMoveNumber = 0;
        else chessState.HalfMoveNumber++;

        if (!attacker.IsWhite) chessState.FullMoveClock++;
    }

    /// <summary>
    /// Generates the FEN string representation of the current chess position from the chessState.
    /// </summary>
    public static string GenerateFEN(ChessBoard chessState)
    {
        var FEN = "";
        int slashCounter = 0;
        foreach (Piece[] pieces in chessState.GameBoard) // loop over each row, they will be seperated by a /
        {
            string row = "";
            var counter = 0; // counter to count empty pieces in a row
            foreach (Piece piece in pieces)
            {
                if (piece.Type == PieceType.Empty) // if empty continue and increment counter
                {
                    counter++;
                    continue; 
                }
                if (counter > 0) // if not empty and counter is above 0, add the count to the string
                {
                    row += counter;
                    counter = 0;
                }
                row += GetFenPieceChar(piece);
            }
            if (counter > 0) row += counter;
            if (slashCounter != 0)
            {
                row += "/";
            }
            slashCounter++;
            FEN = row + FEN;

        }
        FEN += $" {chessState.Turn} "; ; // which turn it is
        FEN += $"{chessState.Castling}"; // which castles are still legal
        FEN += $" {chessState.EnPassantSquare}"; // the en passant square if there is one (only one if a pawn has just moved 2 squares)
        var halfMoveNumber = chessState.HalfMoveNumber; // It resets to 0 whenever a pawn moves or a piece is captured. increments when a pawn does not
        int fullMoveClock = chessState.FullMoveClock; // increments when black moves, starts at one
        FEN += $" {halfMoveNumber}";
        FEN += $" {fullMoveClock}";

        return FEN;
    }

    private static char GetFenPieceChar(Piece piece)
    {
        char symbol = piece.Type switch
        {
            PieceType.King => 'k',
            PieceType.Queen => 'q',
            PieceType.Rook => 'r',
            PieceType.Bishop => 'b',
            PieceType.Knight => 'n',
            PieceType.Pawn => 'p',
            _ => '?'
        };

        // Uppercase for white pieces
        return piece.IsWhite ? char.ToUpper(symbol) : symbol;
    }
}
