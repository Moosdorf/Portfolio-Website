using HelperMethods;


/// <summary>
/// Includes every type a piece can be.
/// </summary>
public enum PieceType
{
    /// <summary>Indicates an empty square with no piece.</summary>
    Empty,
    /// <summary>Pawn piece.</summary>
    Pawn,
    /// <summary>Knight piece.</summary>
    Knight,
    /// <summary>Bishop piece.</summary>
    Bishop,
    /// <summary>Rook piece.</summary>
    Rook,
    /// <summary>Queen piece.</summary>
    Queen,
    /// <summary>King piece.</summary>
    King
}

/// <summary>
/// Represents a Piece that can be placed on a chessboard.
/// </summary>
public abstract class Piece
{
    /// <summary>
    /// The type of the chess piece (e.g., Pawn, King).
    /// </summary>
    public PieceType Type { get; set; }

    /// <summary>
    /// The position of the piece on the board (e.g., "e4").
    /// </summary>
    public string Position { get; set; } = string.Empty;

    /// <summary>
    /// True if the piece is white; otherwise, false.
    /// </summary>
    public bool IsWhite { get; set; }

    /// <summary>
    /// Indicates if this piece is currently pinned.
    /// </summary>
    public bool Pinned { get; set; } = false;

    /// <summary>
    /// Squares to which this piece is pinned and restricted from moving.
    /// </summary>
    public List<string> PinnedSquares { get; set; } = new List<string>();

    /// <summary>
    /// List of available squares the piece can move to.
    /// </summary>
    public List<string> AvailableMoves { get; set; } = new List<string>();

    /// <summary>
    /// List of available squares where the piece can capture an opponent piece.
    /// </summary>
    public List<string> AvailableCaptures { get; set; } = new List<string>();

    /// <summary>
    /// Pieces that threaten this piece.
    /// </summary>
    public List<string> Attackers { get; set; } = new List<string>();

    /// <summary>
    /// Pieces defending this piece.
    /// </summary>
    public List<string> Defenders { get; set; } = new List<string>();

    /// <summary>
    /// Initializes a new instance of the <see cref="Piece"/> class.
    /// </summary>
    /// <param name="white">True if the piece is white; otherwise, false.</param>

    public Piece(bool white)
    {
        IsWhite = white;
    }


    /// <summary>
    /// Finds all possible moves for the piece based on the current chess state.
    /// </summary>
    /// <param name="chessState">The current state of the chessboard.</param>
    public abstract void FindMoves(ChessBoard chessState);

    /// <summary>
    /// Adds a valid move to the piece's available moves list if allowed by game state.
    /// </summary>
    /// <param name="chessState">The current state of the chessboard.</param>
    /// <param name="target">The target square or piece to move to.</param>
    public void AddMove(ChessBoard chessState, Piece target)
    {
        if (Pinned)
        {
            Console.WriteLine("pinned - target " + target.Position);
            Console.WriteLine("pinned - PinnedSquares " + PinnedSquares.Count);
            if (!PinnedSquares.Contains(target.Position)) return;
        }

        if (chessState.InCheck && chessState.CheckedKing?.IsWhite == IsWhite && this != chessState.CheckedKing && !chessState.Blockers.Contains(target.Position))
        {
            return;
        }

        if (Type == PieceType.King)
        {
            if (target.Attackers.Count > 0)
            {
                return;
            }
        }



        if (Type != PieceType.Pawn)
        {
            if (target.Type == PieceType.Empty)
            {
                if ((chessState.Turn == "w") == IsWhite)
                {
                    target.Defenders.Add(Position);
                }
                else
                {
                    target.Attackers.Add(Position);
                }
            }
            else
            { // not empty square
                if (IsWhite != target.IsWhite) target.Attackers.Add(Position);
                else target.Defenders.Add(Position);
            }
        }

        AvailableMoves.Add(target.Position);
    }


    /// <summary>
    /// Adds valid capture moves for this piece.
    /// </summary>
    /// <param name="chessState">The current chess state.</param>
    /// <param name="target">The piece targeted for capture.</param>
    public void AddCaptures(ChessBoard chessState, Piece target)
    {

        if (Pinned)
        {
            Console.WriteLine("pinned");
            if (!PinnedSquares.Contains(target.Position)) return;
        }

        // if the target is the enemy king, find blocking squares and set states
        if (target.Type == PieceType.King && target.IsWhite != IsWhite)
        {
            King king = (King) target;
            ChessMethods.FindCheckBlockers(chessState, (King)target, this);
            chessState.InCheck = true;
            chessState.CheckedKing = king;
        }


        // if the attacker is the king, return if the enemy piece has a defender
        if (Type == PieceType.King)
        {
            if (target.Type != PieceType.Empty && target.Defenders.Count > 0)
            {
                return;
            }
        }

        // if the friendly king is in check, return if this square is not a blocker of the check
        if (chessState.InCheck && chessState.CheckedKing != this && chessState.CheckedKing?.IsWhite == IsWhite && !chessState.Blockers.Contains(target.Position)) 
        {
            return; 
        }

        // if the target is an empty square add this piece as a defender if it is the piece's turn else attacker
        if (target.Type == PieceType.Empty)
        {
            if ((chessState.Turn == "w") == IsWhite)
            {
                target.Defenders.Add(Position);
            } else
            {
                target.Attackers.Add(Position);
            }
        } else
        { // not empty square
            if (IsWhite != target.IsWhite) target.Attackers.Add(Position);
            else target.Defenders.Add(Position);
        }



        if (Type != PieceType.Pawn) // a pawn cannot capture in front
        {
            AvailableCaptures.Add(target.Position);
        } else
        {
            if (target.Type != PieceType.Empty && target.IsWhite != IsWhite) AvailableCaptures.Add(target.Position);
            if (target.Type == PieceType.Empty && target.Position == chessState.EnPassantSquare) AvailableCaptures.Add(target.Position);
        }
    }

    /// <summary>
    /// Updates the available moves and captures for this piece based on the board state at the given position.
    /// </summary>
    /// <param name="chessState">The current chess state.</param>
    /// <param name="iRow">Row index on the board.</param>
    /// <param name="iCol">Column index on the board.</param>
    /// <returns>True if the move is valid and can continue; otherwise, false.</returns>
    public bool PieceBlockedDirection(ChessBoard chessState, int iRow, int iCol)
    {
        var piece = chessState.GameBoard[iRow][iCol];

        if (piece.Type == PieceType.Empty)
        {
            AddMove(chessState, piece);
            return true;
        }
        else if (piece.IsWhite != IsWhite)
        {
            AddCaptures(chessState, piece);
        }
        // else
        if (piece.IsWhite == IsWhite) piece.Defenders.Add(Position);
        return false; 
    }

    /// <summary>
    /// Returns a string representation of the piece.
    /// </summary>
    /// <returns>A string describing the piece type, position, available moves, and color.</returns>
    public override string? ToString()
    {
        return $"Type: {Type}, " +
               $"Position: {Position}, " +
               $"AvailableMoves: {AvailableMoves.Count}, " +
               $"AvailableCaptures: {AvailableCaptures.Count}, " +
               $"Color: {(IsWhite ? "White" : "Black")}";
    }
}
