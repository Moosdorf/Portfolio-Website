import { useEffect, useState } from "react";
import type { CardData } from "../data/CardData";
import Card from "./Card"
type Props = {
    projects: CardData[] | undefined;
}


function CardContainer() {
    const [projects, setProjects] = useState<CardData[]>();
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetch(`https://localhost:5270/api/projects`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }).then(data => {
                return data.json();
            }).then(raw => {
                console.log(raw)
                setProjects(raw)
                setFetching(false);
        })
    }, [])


    if (projects == undefined) return (<>error</>)
    if (fetching) {
        return (
        <div className="projects-page p-5">
          <h1>Loading</h1>
        </div>
        )
    }
    
    return (
        <div className="card-container border border-gray-300 rounded-lg p-8
                        flex flex-col items-center gap-6
                        sm:flex-row sm:flex-wrap sm:justify-around">
            <h2>Projects</h2>
            {projects.map(project => (
                <Card 
                    key={project.id}
                    id={project.id}
                    title={project.title}
                    path={project.path}
                    description={project.description}
                />
            ))}
        </div>
    )
}

export default CardContainer