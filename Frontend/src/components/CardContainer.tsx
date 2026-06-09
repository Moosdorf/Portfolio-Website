import Card from "./Card"

function CardContainer() {
    return (
        <div className="card-container border border-gray-300 rounded-lg p-8
                        flex flex-col items-center gap-6
                        sm:flex-row sm:flex-wrap sm:justify-around">
            <Card title="Project 1" description="Description of project 1" id={1}/>
            <Card title="Project 1" description="Description of project 1" id={1}/>
            <Card title="Project 1" description="Description of project 1" id={1}/>
            <Card title="Project 1" description="Description of project 1" id={1}/>
            <Card title="Project 2" description="Description of project 2" id={2}/>
            <Card title="Project 3" description="Description of project 3" id={3}/>
        </div>
    )
}

export default CardContainer