using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

/// <summary>
/// Represents an empty square.
/// </summary>
public class Empty(bool white) : Piece(white)
{
    public override void FindMoves(ChessBoard chessState)
    {
    }


}
