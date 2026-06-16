import type { CardData } from "../data/CardData";
import Card from "./Card"
type Props = {
    projects: CardData[] | undefined;
}


function CardContainer({ projects }: Props) {
    if (projects == undefined) return (<>error</>)
    return (
        <div className="card-container border border-gray-300 rounded-lg p-8
                        flex flex-col items-center gap-6
                        sm:flex-row sm:flex-wrap sm:justify-around">
            {projects.map(project => (
                <Card 
                    key={project.id}
                    id={project.id}
                    title={project.title}
                    description={project.description}
                />
            ))}
        </div>
    )
}

export default CardContainer