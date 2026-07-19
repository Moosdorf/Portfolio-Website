import { useState } from "react";
import ChessBoardProvider from "../../../data/providers/ChessBoardProvider"
import ChessBoardDisplay from "../../../components/Chess/ChessBoardDisplay"
import { ChessGameMode, type SelectedGameOptions } from "../../../components/Chess/ChessTypes";
import { useAuth } from "../../../data/providers/AuthProvider";
import { Button } from "../../../components/Button";
import { Link } from "react-router-dom";
import SelectionPanel from "../../../components/SelectionPanel";

function ChessBotGame() {
    const { user } = useAuth()
    const [started, setStarted] = useState(false);
    const [options, setOptions] = useState<SelectedGameOptions>(
        {
            gameMode: ChessGameMode.bot,
            selectedColor: "random",
            username: user?.username || null
        }
    )

    if (!started) {
        return (
            <SelectionPanel title="Bot Game" subtitle="Select your color">
                <div className="flex gap-4 justify-center">
                    <Button variant="secondary"
                        className="w-20 relative overflow-hidden transition-transform"
                        onClick={() => {
                            setOptions(options => ({...options, selectedColor: "white"}));
                            setStarted(true);
                        }} > White
                        <span className="absolute bottom-0 left-0 w-full h-1.5"
                            style={{ backgroundColor: "white", border: "1px solid #ccc" }}
                        />
                    </Button>

                    <Button variant="secondary" className="w-20 relative overflow-hidden transition-transform"
                            onClick={() => {
                                setOptions(options => ({...options, selectedColor: "black"}));
                                setStarted(true);
                            }} > 
                        Black
                        <span className="absolute bottom-0 left-0 w-full h-1.5"
                            style={{ backgroundColor: "black", border: "1px solid #292929" }}
                        />
                    </Button>

                    <Button variant="secondary" className="w-20 relative overflow-hidden transition-transform"
                        onClick={() => {
                            setOptions(options => ({...options, selectedColor: Math.random() < 0.5 ? "white" : "black"}));
                            setStarted(true);
                        }}
                    > Random
                        <span className="absolute bottom-0 left-0 w-full h-1.5"
                            style={{
                                backgroundImage: "linear-gradient(90deg, white 50%, black 50%)"
                            }}
                        />
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
                <ChessBoardDisplay key={"bot"}/>
            </ChessBoardProvider>
        </div>
    )
        
}


export default ChessBotGame;