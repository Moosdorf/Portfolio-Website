import { Link } from"react-router-dom";
import ChessBoardDisplay from "../../../components/Chess/ChessBoardDisplay";
import { ChessGameMode, type SelectedGameOptions } from "../../../components/Chess/ChessTypes";
import SelectionPanel from "../../../components/SelectionPanel";
import { useAuth } from "../../../data/providers/AuthProvider";
import ChessBoardProvider from "../../../data/providers/ChessBoardProvider";
import { useState } from "react";
import { Button } from "../../../components/Button";

function ChessFreeplay() {
const { user } = useAuth()
    const [started, setStarted] = useState(false);
    const [options, setOptions] = useState<SelectedGameOptions>(
        {
            gameMode: ChessGameMode.freeplay,
            selectedColor: "random",
            username: user?.username || null
        }
    )

    if (!started) {
        return (
            <SelectionPanel title="Freeplay" subtitle="">
                <div className="flex gap-4 justify-center">
                    <Button variant="secondary"
                        className="w-20 relative overflow-hidden transition-transform"
                        onClick={() => {
                            setOptions(options => ({...options, selectedColor: "white"}));
                            setStarted(true);
                        }} > 
                        Freeplay

                    </Button>

                    <Button variant="secondary" className=" relative overflow-hidden transition-transform"
                            onClick={() => {
                                setOptions(options => ({...options, selectedColor: "black"}));
                                setStarted(true);
                            }} > 
                        Import FEN
                    </Button>

                </div>

                <Link to="/projects/chess">
                    <Button variant="secondary">Back</Button>
                </Link>
            </SelectionPanel>
        )
    }

    return (
        <div>
            <ChessBoardProvider selectedGameOptions={options}>
                <ChessBoardDisplay key={"freeplay"}/>
            </ChessBoardProvider>
        </div>
    )
        
}


export default ChessFreeplay