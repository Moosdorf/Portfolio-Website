import { useEffect, useState } from "react";
import { Button } from "../../../components/Button";
import { type Project } from "../../../components/Chess/ChessTypes";
import { Link } from "react-router-dom";

function ChessProject() {
    const [chessProject, setProject] = useState<Project>();


    useEffect(() => {
        fetch(`https://localhost:5270/api/Projects/1`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }).then(data => {
            return data.json();
        }).then(json => {
            console.log(json)
            setProject(json);
        })
    }, [])
   
    if (!chessProject) return (<div>
        <h1>Loading project...</h1>
    </div>)

    return (
        <div>
            <h1>{chessProject.title}</h1>

            <p>This project focused on creating a chess-game from scratch, including multi-player games, bot-games and puzzles. </p>
            <div className="flex gap-4 justify-center max-w-4xl mx-auto p-20">
                {/*<Button onClick={() => setGameMode(ChessGameMode.Multiplayer)}>Multiplayer game</Button>*/}
                <Link to="/projects/chess/bot"><Button>Bot game</Button></Link>
                <Link to="/projects/chess/puzzle"><Button>Solve puzzles</Button></Link>
                <Link to="/projects/chess/freeplay"><Button>Freeplay</Button></Link>
            </div>
        </div>
    )

}

export default ChessProject