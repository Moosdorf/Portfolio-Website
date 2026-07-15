import type { ChessGame } from "./ChessTypes"
import PieceDisplay from "./PieceDisplay"

            
            
function ChessPuzzleDisplay({chessGame} : {chessGame : ChessGame}) {


    return(
        <div className="wrapper" style={{ position: "relative" }}>
            {/* Chessboard */}
            <div className="chessboard">
                {chessGame.ChessBoard.GameBoard.map((rank, rankIndex) =>
                    rank.map((piece, colIndex) => (
                        <div
                            key={piece.Position}
                            className={`square ${(rankIndex + colIndex) % 2 === 0 ? "light" : "dark"}`}
                        >
                            <PieceDisplay piece={piece} />
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default ChessPuzzleDisplay

