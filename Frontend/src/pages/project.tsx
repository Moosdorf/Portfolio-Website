import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";


function Project() {
    let { id }= useParams(); // "id" must match the ":id" in the route path
    const [project, setProject] = useState();
    useEffect(() => {
        fetch(`https://localhost:5270/api/projects/` + id, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }).then(data => {
            console.log(data)
            return data.json();
        }).then(json => {
            setProject(json.result);
            console.log(json.result)
        })
    }, [])
   
    if (!project) return (<div>
        <h1>Loading project...</h1>
    </div>)
    return (
        <div>
            <h1>{project.title}</h1>
        </div>
    )
}

export default Project