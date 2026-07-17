using Backend.Application.Chess.DTO;
using Backend.Domain.Entities.Chess;
using HelperMethods;



public class ChessBoard
{

    // if it is whites turn then we must find moves for the black pieces first, these lists can be used for that.
    // building initial FEN 
    public string Turn { get; set; } = "w"; // fen 1
    public string Castling { get; set; } = "KQkq"; // fen 2
    public string EnPassantSquare { get; set; } = "-"; // fen 3
    public int HalfMoveNumber { get; set; } = 0; // fen 4
    public int FullMoveClock { get; set; } = 0; // fen 5
    public string FEN { get; set; } // total FEN


    // game info
    public bool InCheck { get; set; } = false;
    public King? CheckedKing { get; set; } = null;
    public string LastMove { get; set; } = "";
    public bool CheckMate { get; set; } = false;

    public string? Winner { get; set; } = null;


    // board information
    public Piece[][] GameBoard { get; private set; }

    // piece info
    public List<Piece> BlackPieces { get; private set; } = [];
    public List<Piece> WhitePieces { get; private set; } = [];
    public King BlackKing { get; private set; } = null!;
    public King WhiteKing { get; private set; } = null!;

    public List<string> Blockers { get; set; } = [];


    public ChessBoard() // used when the game starts initially
    {
        this.GameBoard = CreateGameBoard(); // creates game board with pieces in default position
        InitializeInfo("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"); // set information like kings
        FindAvailableMoves(); // find all moves for all pieces

    }
    public ChessBoard(string FEN) // list of moves already played, use this to catch up to the correct state
    {
        CreateChessState(FEN);
        InitializeInfo(FEN);
        FindAvailableMoves(); 
    }

    private void InitializeInfo(string FEN)
    {
        this.FEN = FEN;

        // need a list of pieces (black and white)
        foreach (Piece piece in GameBoard.SelectMany(row => row))
        {

            if (piece.Type == PieceType.Empty) continue;

            if (piece.IsWhite) // if piece is white
            {
                WhitePieces.Add(piece); // add to list of white pieces
                if (piece.Type == PieceType.King) WhiteKing = (King)piece; // and set king
            }
            else
            {
                BlackPieces.Add(piece);
                if (piece.Type == PieceType.King) BlackKing = (King) piece;
                
            }
            
        }
    }


    public bool Move(MoveModel moveModel)
    {
        var move = moveModel.Move;

        // check if move is good
        var canMove = ValidateMove(move);
        if (!canMove) return false;

        // make the move
        ChessMethods.MakeMove(this, moveModel);
        LastMove = move;

        FindAvailableMoves();
       

        return true;
    }
    public bool ValidateMove(string move)
    {
        var (fRow, fCol, tRow, tCol) = ChessMethods.ConvertMoveToColRow(move);
        // find attacker and target from the GameBoard
        var attacker = GameBoard[fRow][fCol];
        var target = GameBoard[tRow][tCol];
        // check if pieces are null
        if (attacker == null || target == null)
        {
            return false;
        }

        if (attacker.AvailableCaptures.Contains(target.Position) || attacker.AvailableMoves.Contains(target.Position))
        { // if the piece has the move in their list its a valid move
            return true;
        }
        Console.WriteLine(attacker);
        Console.WriteLine("no available moves");
        return false;
    }

    public void FindAvailableMoves()
    {
        CheckedKing = null;
        InCheck = false;
        Blockers = [];
        
        // reset all piece stats
        foreach (var piece in GameBoard.SelectMany(row => row))
        {
            piece.Pinned = false;
            piece.PinnedSquares = new();
            piece.AvailableMoves = new();
            piece.AvailableCaptures = new();
            piece.Attackers = new();
            piece.Defenders = new();
        }

        if (Turn == "w")
        {
            foreach (var piece in BlackPieces)
            {
                piece.FindMoves(this);
            }
            FindPins();
            foreach (var piece in WhitePieces)
            {
                piece.FindMoves(this);
            }
        } else
        {
            foreach (var piece in WhitePieces)
            {
                piece.FindMoves(this);
            }
            FindPins();
            foreach (var piece in BlackPieces)
            {
                piece.FindMoves(this);
            }
        }


        if (InCheck)
        {
            var activePieces = (CheckedKing.IsWhite) ? WhitePieces : BlackPieces;
            CheckMate = true;
            foreach (var piece in activePieces)
            {
                if (piece.AvailableCaptures.Count == 0 && piece.AvailableMoves.Count == 0) continue;
                CheckMate = false;
            }
            Winner = (CheckedKing.IsWhite) ? "Black" : "White";
        }
    }

    private void FindPins()
    {
        var currentKing = Turn == "w" ? WhiteKing : BlackKing;

        (int kingRow, int kingCol) = ChessMethods.RankFileToRowCol(currentKing.Position);

        int[][] directions =
        [
            [-1, 0], // up
            [1, 0],  // down
            [0, 1],   // right
            [0, -1],  // left
            [-1, -1], // up-left
            [1, -1],  // down-left
            [1, 1],   // down-right
            [-1, 1],  // up-right
        ];


        foreach (var dir in directions)
        {
            int dRow = dir[0], dCol = dir[1];
            Piece foundFriendly = null;

            for (int iRow = kingRow + dRow, iCol = kingCol + dCol; // find new row and col based on the direction
                 iRow >= 0 && iRow < 8 && iCol >= 0 && iCol < 8; // within gameboard
                 iRow += dRow, iCol += dCol) // increment by deltaCol or row, -1 or 1.
            {
                var reviewPiece = GameBoard[iRow][iCol];
                if (reviewPiece.Type == PieceType.Empty) continue;
                if (reviewPiece.IsWhite == currentKing.IsWhite)
                {
                    if (foundFriendly != null) break; // found another friendly in a row, not pinned
                    foundFriendly = reviewPiece;
                }
                if (reviewPiece.IsWhite != currentKing.IsWhite && foundFriendly != null) // friendly piece might be pinned. 
                {
                    (int fRow, int fCol) = ChessMethods.RankFileToRowCol(foundFriendly.Position); // find its position on the board in row col
                    (int rRow, int rCol) = ChessMethods.RankFileToRowCol(reviewPiece.Position); // find its position on the board in row col
                    // check if diagonal to piece
                    if (Math.Abs(kingRow - rRow) == Math.Abs(kingCol - rCol))  // check if diagonal 
                    {
                        if (reviewPiece.Type == PieceType.Bishop || reviewPiece.Type == PieceType.Queen) // only queen or bishop can make diagonal attacks in range
                        {
                            foundFriendly.Pinned = true;
                            FindPinnedMovableSquares(fRow, fCol, dRow, dCol);
                            break;

                        }
                    } // if straight then its rook or queen
                    if (reviewPiece.Type == PieceType.Rook || reviewPiece.Type == PieceType.Queen)
                    {
                        foundFriendly.Pinned = true;
                        FindPinnedMovableSquares(fRow, fCol, dRow, dCol);
                        break;
                    }


                }
            }
        }
    }

    private void FindPinnedMovableSquares(int pinnedRow, int pinnedCol, int dRow, int dCol)
    {
        // find squares that can be walked on
        for (int jRow = pinnedRow + dRow, jCol = pinnedCol + dCol; // find new row and col based on the direction
                jRow >= 0 && jRow < 8 && jCol >= 0 && jCol < 8; // within gameboard
                jRow += dRow, jCol += dCol) // increment by deltaCol or row, -1 or 1.
        {
            Console.WriteLine(ChessMethods.RowColToRankFile(jRow, jCol));
            GameBoard[pinnedRow][pinnedCol].PinnedSquares.Add(ChessMethods.RowColToRankFile(jRow, jCol));
            if (GameBoard[jRow][jCol].Type != PieceType.Empty) break;
        }
        for (int jRow = pinnedRow - dRow, jCol = pinnedCol - dCol; // find new row and col based on the direction
        jRow >= 0 && jRow < 8 && jCol >= 0 && jCol < 8; // within gameboard
        jRow -= dRow, jCol -= dCol) // increment by deltaCol or row, -1 or 1.
        {
            Console.WriteLine(ChessMethods.RowColToRankFile(jRow, jCol));
            GameBoard[pinnedRow][pinnedCol].PinnedSquares.Add(ChessMethods.RowColToRankFile(jRow, jCol));
            if (GameBoard[jRow][jCol].Type != PieceType.Empty) break;
        }

    }

    public void CreateChessState(string FEN)
    {
        var fenSPLIT = FEN.Split(" ");
        // index 0 is the boardstate
        // index 1 is the turn w / b
        // index 2 is castling rights
        // index 3 is en passant square
        // index 4 halfmove number - increments when a non pawn pieces moves, resets when a pawn moves
        // index 5 fullmoveclock - increments when black moves

        GameBoard = ConvertFENtoBoard(fenSPLIT[0]);
        Turn = fenSPLIT[1];
        Castling = fenSPLIT[2];
        EnPassantSquare = fenSPLIT[3];
        HalfMoveNumber = int.Parse(fenSPLIT[4]);
        FullMoveClock = int.Parse(fenSPLIT[5]);

    }

    private Piece[][] ConvertFENtoBoard(string v)
    {
        var chessBoard = new Piece[8][]; // ends as final result 

        for (int iRow = 0; iRow < 8; iRow++) 
        {
            chessBoard[iRow] = new Piece[8];
        }

        int row = 7, col = 0;
        foreach (char currentChar in v)
        {
            // if empty square
            if (currentChar >= '1' && currentChar <= '8')
            {
                int numberOfEmpties = int.Parse(currentChar.ToString());
                for (int i = 0; i < numberOfEmpties; i++)
                {
                    chessBoard[row][col] = new Empty(false)
                    {
                        Type = PieceType.Empty,
                        Position = ChessMethods.RowColToRankFile(row, col)
                    };
                    col++;
                }
                continue;
            }

            switch (currentChar)
            {
                case 'P': // white cases
                case 'N':
                case 'B':
                case 'R':
                case 'Q':
                case 'K':
                case 'p': // black cases
                case 'n':
                case 'b':
                case 'r':
                case 'q':
                case 'k':
                    bool isWhite = char.IsUpper(currentChar);
                    PieceType type = currentChar switch // determine the type of each piece on the board
                    {
                        'P' or 'p' => PieceType.Pawn,
                        'N' or 'n' => PieceType.Knight,
                        'B' or 'b' => PieceType.Bishop,
                        'R' or 'r' => PieceType.Rook,
                        'Q' or 'q' => PieceType.Queen,
                        'K' or 'k' => PieceType.King,
                    };

                    chessBoard[row][col] = type switch // create new pieces
                    {
                        PieceType.Pawn => new Pawn(isWhite),
                        PieceType.Knight => new Knight(isWhite),
                        PieceType.Bishop => new Bishop(isWhite),
                        PieceType.Rook => new Rook(isWhite),
                        PieceType.Queen => new Queen(isWhite),
                        PieceType.King => new King(isWhite),
                        _ => new Empty(false)
                    };
                    // set their type and position
                    chessBoard[row][col].Type = type; 
                    chessBoard[row][col].Position = ChessMethods.RowColToRankFile(row, col);
                    col++;
                    break;

                case '/':
                    row--;
                    col = 0;
                    break;
            }
        }

        return chessBoard; 
    }

    public Piece[][] CreateGameBoard()
    {
        var chessBoard = new Piece[8][]; // ends as final result 

        for (int row = 0; row < 8; row++) // initiate each row in the jagged array (must be done otherwise we have no arrays to push to)
        {
            chessBoard[row] = new Piece[8];
        }

        chessBoard[0][0] = new Rook(true) { Type = PieceType.Rook, Position = ChessMethods.RowColToRankFile(0, 0) };
        chessBoard[0][1] = new Knight(true) { Type = PieceType.Knight, Position = ChessMethods.RowColToRankFile(0, 1) };
        chessBoard[0][2] = new Bishop(true) { Type = PieceType.Bishop, Position = ChessMethods.RowColToRankFile(0, 2) };
        chessBoard[0][3] = new Queen(true) { Type = PieceType.Queen, Position = ChessMethods.RowColToRankFile(0, 3) };
        chessBoard[0][4] = new King(true) { Type = PieceType.King, Position = ChessMethods.RowColToRankFile(0, 4) };
        chessBoard[0][5] = new Bishop(true) { Type = PieceType.Bishop, Position = ChessMethods.RowColToRankFile(0, 5) };
        chessBoard[0][6] = new Knight(true) { Type = PieceType.Knight, Position = ChessMethods.RowColToRankFile(0, 6) };
        chessBoard[0][7] = new Rook(true) { Type = PieceType.Rook, Position = ChessMethods.RowColToRankFile(0, 7) };

        chessBoard[7][0] = new Rook(false) { Type = PieceType.Rook, Position = ChessMethods.RowColToRankFile(7, 0) };
        chessBoard[7][1] = new Knight(false) { Type = PieceType.Knight, Position = ChessMethods.RowColToRankFile(7, 1) };
        chessBoard[7][2] = new Bishop(false) { Type = PieceType.Bishop, Position = ChessMethods.RowColToRankFile(7, 2) };
        chessBoard[7][3] = new Queen(false) { Type = PieceType.Queen, Position = ChessMethods.RowColToRankFile(7, 3) };
        chessBoard[7][4] = new King(false) { Type = PieceType.King, Position = ChessMethods.RowColToRankFile(7, 4) };
        chessBoard[7][5] = new Bishop(false) { Type = PieceType.Bishop, Position = ChessMethods.RowColToRankFile(7, 5) };
        chessBoard[7][6] = new Knight(false) { Type = PieceType.Knight, Position = ChessMethods.RowColToRankFile(7, 6) };
        chessBoard[7][7] = new Rook(false) { Type = PieceType.Rook, Position = ChessMethods.RowColToRankFile(7, 7) };



        // creating and pushing black pawns
        for (int col = 0; col < 8; col++)
        {
            chessBoard[1][col] = new Pawn(true) { Type = PieceType.Pawn, Position = ChessMethods.RowColToRankFile(1, col) }; // insert white pawns
            chessBoard[6][col] = new Pawn(false) { Type = PieceType.Pawn, Position = ChessMethods.RowColToRankFile(6, col) }; // insert black pawns

        }

        for (int row = 2; row < 6; row++)
        {
            for (int col = 0; col < 8; col++)
            {
                chessBoard[row][col] = new Empty(false) { Type = PieceType.Empty, Position = ChessMethods.RowColToRankFile(row, col) };
            }
        }

        return chessBoard;
    }

    public override string? ToString()
    {
        var blackKingPos = BlackKing != null ? BlackKing.Position.ToString() : "null";
        var whiteKingPos = WhiteKing != null ? WhiteKing.Position.ToString() : "null";

        return $"Black Pieces: {BlackPieces?.Count ?? 0}\n" +
               $"White Pieces: {WhitePieces?.Count ?? 0}\n" +
               $"Black King Position: {blackKingPos}\n" +
               $"White King Position: {whiteKingPos}";
    }

}
