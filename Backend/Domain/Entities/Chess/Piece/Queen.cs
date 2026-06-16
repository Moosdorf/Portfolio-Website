using HelperMethods;


public class Queen(bool white) : Piece(white)   
{
    public override void FindMoves(ChessBoard chessState)
    {
        (int row, int col) = ChessMethods.RankFileToRowCol(Position);

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
            bool kingHit = false;
            int dRow = dir[0], dCol = dir[1];
            for (int iRow = row + dRow, iCol = col + dCol;
                 iRow >= 0 && iRow < 8 && iCol >= 0 && iCol < 8; // within 
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
