using HelperMethods;


/// <summary>
/// Represents a Pawn chess piece.
/// </summary>
public class Pawn(bool white) : Piece(white) 
{
    public override void FindMoves(ChessBoard chessState)
    {
        (int row, int col) = ChessMethods.RankFileToRowCol(this.Position);


        // moving 
        MovePawnOneOrTwo(chessState, row, col);

        // captures left
        CaptureLeft(chessState, row, col);

        // captures right
        CaptureRight(chessState, row, col);
    }

    private void MovePawnOneOrTwo(ChessBoard chessState, int row, int col)
    {
        Piece piece;
        bool isOnStartingSquare = (IsWhite && row == 1) || (!IsWhite && row == 6);
        if (isOnStartingSquare)
        {
            for (int i = 1; i < 3; i++)
            {
                piece = chessState.GameBoard[this.IsWhite ? row + i : row - i][col]; // check two in front
                if (piece.Type == PieceType.Empty)
                {
                    AddMove(chessState, piece);
                }
                else break;
            }
        }
        else
        {
            if (row + 1 < 8 && row - 1 >= 0)
            {
                piece = chessState.GameBoard[this.IsWhite ? row + 1 : row - 1][col]; // check only one in front
                if (piece.Type == PieceType.Empty)
                {
                    AddMove(chessState, piece);
                }
            }
        }
    }


    private void CaptureLeft(ChessBoard chessState, int row, int col)
    {
        if (col - 1 >= 0 && row + 1 < 8 && row - 1 >= 0)
        {
            var piece = chessState.GameBoard[this.IsWhite ? row + 1 : row - 1][col - 1]; // check left-side capture, if the piece is not at the edge
            AddCaptures(chessState, piece);
        }
    }



    private void CaptureRight(ChessBoard chessState, int row, int col)
    {
        if (col + 1 <= 7 && row + 1 <= 7 && row - 1 >= 0)
        {
            var piece = chessState.GameBoard[this.IsWhite ? row + 1 : row - 1][col + 1]; // same but for right-side
            AddCaptures(chessState, piece);
        }
    }

}

