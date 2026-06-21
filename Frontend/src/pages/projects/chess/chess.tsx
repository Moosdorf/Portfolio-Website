import { useEffect, useState } from "react";
import { Button } from "../../../components/Button";
import ChessBoard from "../../../components/Chess/ChessBoard";
import ChessBoardDisplay from "../../../components/Chess/ChessBoardDisplay";

const ChessGameMode = {
  None: "None",
  Multiplayer: "Multiplayer",
  Bot: "Bot",
  Puzzle: "Puzzle",
} as const;

type ChessGameMode = (typeof ChessGameMode)[keyof typeof ChessGameMode];

export type Project = {
    title: string,
    description: string,
    id: number
}


function ChessProject() {
    const [chessProject, setProject] = useState<Project>();
    const [gameMode, setGameMode] = useState<ChessGameMode>(ChessGameMode.None)
    useEffect(() => {
        fetch(`https://localhost:5270/api/projects/2`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }).then(data => {
            return data.json();
        }).then(json => {
            setProject(json.result);
        })
    }, [])
   
    if (!chessProject) return (<div>
        <h1>Loading project...</h1>
    </div>)

    switch(gameMode) {
        case ChessGameMode.None: {
            return (
                <div>
                    <h1>{chessProject.title}</h1>

                    <p>This project focused on creating a chess-game from scratch, including multi-player games, bot-games and puzzles. </p>
                    
                    
                    <div className="flex gap-4 justify-center max-w-4xl mx-auto p-20">
                        <Button onClick={() => setGameMode(ChessGameMode.Multiplayer)}>Multiplayer game</Button>
                        <Button onClick={() => setGameMode(ChessGameMode.Bot)}>Bot game</Button>
                        <Button onClick={() => setGameMode(ChessGameMode.Puzzle)}>Solve puzzles</Button>
                    </div>
                </div>
            )
        }

        case ChessGameMode.Multiplayer: {
            return (
                <div>
                    <ChessBoard>
                        <ChessBoardDisplay key={"multiplayer"}/>
                    </ChessBoard>
                </div>
            )
        }

        case ChessGameMode.Bot: {   
            return (
                <div>
                    <ChessBoard>
                        <ChessBoardDisplay key={"bot"}/>
                    </ChessBoard>
                </div>
            )
        }

        case ChessGameMode.Puzzle: {
            return (
                <div>
                    <ChessBoard>
                        <ChessBoardDisplay key={"puzzle"}/>
                    </ChessBoard>
                </div>
            )
        }
    }


}

export default ChessProject