using HelperMethods;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

/// <summary>
/// Represents a King chess piece.
/// </summary>
public class King(bool white) : Piece(white)
{
    public override void FindMoves(ChessBoard chessState)
    {
        (int row, int col) = ChessMethods.RankFileToRowCol(this.Position);


        for (int iRow = row - 1; iRow <= row + 1; iRow++)
        {
            for (int iCol = col - 1; iCol <= col + 1; iCol++)
            {
                if (iRow >= 0 && iRow < 8 && iCol >= 0 && iCol < 8)
                {
                    if (chessState.GameBoard[iRow][iCol] == this) continue;
                    PieceBlockedDirection(chessState, iRow, iCol);
                }
            }
        }

        if (!chessState.InCheck)
        {
            CheckQueenSideCastle(chessState);
            CheckKingSideCastle(chessState);
        }

    }

    private void CheckKingSideCastle(ChessBoard chessState)
    {
        var fenKingCastle = (IsWhite) ? "K" : "k";

        if (chessState.Castling.Contains(fenKingCastle))
        {
            (var row, var col) = ChessMethods.RankFileToRowCol(Position);

            for (int i = 1; i < 4; i++)
            {
                var target = chessState.GameBoard[row][col + i];
                if (target.Type == PieceType.Empty && target.Attackers.Count == 0)
                {
                    continue;
                }
                if (target.Type == PieceType.Rook && target.IsWhite == IsWhite)
                {
                    var possibleMove = chessState.GameBoard[row][col + 2];
                    AvailableMoves.Add(possibleMove.Position);
                }
                break;
            }
        }

    }



    
    private void CheckQueenSideCastle(ChessBoard chessState)
    {
        (var row, var col) = ChessMethods.RankFileToRowCol(Position);


        var fenQueenCastle = (IsWhite) ? "Q" : "q";

        if (chessState.Castling.Contains(fenQueenCastle))
        {
            for (int i = 1; i < 5; i++)
            {
                var target = chessState.GameBoard[row][col - i];

                if (target.Type == PieceType.Empty)
                {
                    if ((col - i == 1) || ((target.Attackers.Count == 0) && (col - i != 1)))
                    {
                        continue;
                    }
                }

                if (target.Type == PieceType.Rook && target.IsWhite == IsWhite)
                {
                    var possibleMove = chessState.GameBoard[row][col - 2];
                    AvailableMoves.Add(possibleMove.Position);
                }
                else if (col - i != 1)
                    break;
            }

        }

    }


}
