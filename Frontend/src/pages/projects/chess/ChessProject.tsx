import { useEffect, useState } from "react";
import { Button } from "../../../components/Button";
import { type Project } from "../../../components/Chess/ChessTypes";
import { Link } from "react-router-dom";
import SelectionPanel from "../../../components/SelectionPanel";

const SECTIONS = [
    { id: "overview", label: "Overview" },
    { id: "base-board", label: "Creating the chessboard" },
    { id: "base-pieces", label: "Creating the chesspieces" },
    { id: "base-modes", label: "Creating different gamemodes" },
    { id: "puzzles", label: "Lichess puzzle import" },
    { id: "testing", label: "Testing" },
];

function ChessProject() {
    const [chessProject, setProject] = useState<Project>();

    useEffect(() => {
        fetch(`https://localhost:5270/api/Projects/1`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
            .then((data) => data.json())
            .then((json) => setProject(json));
    }, []);

    if (!chessProject) {
        return (
            <div className="w-full p-5">
                <h1 className="text-2xl font-bold">Loading project...</h1>
            </div>
        );
    }

    return (
        <div className="w-full p-5">
            <header className="mb-10">
                <h1 className="text-2xl font-bold">{chessProject.title}</h1>
                <p className="text-sm text-gray-500 mt-1">
                    This project focused on creating a chess-game from scratch, including multi-player games, bot-games and puzzles.
                </p>
            </header>


            <SelectionPanel title="Choose gamemode">
                <div className="flex gap-4 justify-center">
                    {/*<Button onClick={() => setGameMode(ChessGameMode.Multiplayer)}>Multiplayer game</Button>*/}
                    <Link to="/projects/chess/bot"><Button variant="secondary">Bot game</Button></Link>
                    <Link to="/projects/chess/puzzle"><Button variant="secondary">Solve puzzles</Button></Link>
                    <Link to="/projects/chess/freeplay"><Button variant="secondary">Freeplay</Button></Link>
                </div>
            </SelectionPanel>

            <div className="flex flex-col-reverse md:flex-row gap-10">
                <div className="flex-1 border border-gray-100 rounded-lg p-8">
                    {SECTIONS.map((section) => (
                        <section key={section.id} id={section.id} className="py-6 first:pt-0 last:pb-0 scroll-mt-5">
                            <h2 className="text-lg font-semibold mb-3 border-b border-gray-300 pb-2">
                                {section.label}
                            </h2>
                            <p className="text-sm text-gray-400">
                                {/* content goes here */}
                            </p>
                        </section>
                    ))}
                </div>

                <nav className="md:w-32 shrink-0">
                    <ul className="md:sticky md:top-5 flex flex-row md:flex-col flex-wrap gap-x-3 gap-y-0.5 text-xs">
                        {SECTIONS.map((section) => (
                            <li key={section.id}>
                                <a href={`#${section.id}`} className="block py-0.5 text-gray-500 hover:text-gray-900">
                                    {section.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    );
}

export default ChessProject;