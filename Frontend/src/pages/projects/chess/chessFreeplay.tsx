import ChessBoard from "../../../components/Chess/ChessBoard"
import ChessBoardDisplay from "../../../components/Chess/ChessBoardDisplay"

function ChessFreeplay() {
    return (
        <div>
            <ChessBoard selectedGameOptions={options}>
                <ChessBoardDisplay selectedGameOptions={options} key={"freeplay"}/>
            </ChessBoard>
        </div>
    )
        
}


export default ChessFreeplay