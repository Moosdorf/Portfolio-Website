using HelperMethods;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

/// <summary>
/// Represents a Bishop chess piece.
/// </summary>
public class Bishop(bool white) : Piece(white)
{
    public override void FindMoves(ChessBoard chessState)
    {
        (int row, int col) = ChessMethods.RankFileToRowCol(this.Position);


        int[][] directions =
        [
            [-1, -1], // up-left
            [1, -1],  // down-left
            [1, 1],   // down-right
            [-1, 1],  // up-right
        ];
        foreach (var dir in directions)
        {
            bool kingHit = false;
            int dRow = dir[0], dCol = dir[1];
            for (int iRow = row + dRow, iCol = col + dCol;
                 iRow >= 0 && iRow < 8 && iCol >= 0 && iCol < 8;
                 iRow += dRow, iCol += dCol)
            {
                var target = chessState.GameBoard[iRow][iCol];
                if (kingHit)
                {
                    if (target.Type != PieceType.Empty) break;
                    target.Attackers.Add(Position);
                    continue;
                }
                if (!PieceBlockedDirection(chessState, iRow, iCol))
                {
                    if (target.Type == PieceType.King && target.IsWhite != IsWhite)
                    {
                        kingHit = true;
                        continue;
                    }
                    break;
                }
            }
        }
    }

}
