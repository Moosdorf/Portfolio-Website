import { useEffect, useState } from "react";


function WebsiteProject() {
    const [websiteProject, setProject] = useState();
    useEffect(() => {
        fetch(`https://localhost:5270/api/Projects/0`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }).then(data => {
            console.log(data)
            return data.json();
        }).then(json => {
            setProject(json);
        })
    }, [])
   
    if (!websiteProject) return (<div>
        <h1>Loading project...</h1>
    </div>)
    return (
        <div>
            <h1>{websiteProject.title}</h1>
        </div>
    )
}

export default WebsiteProject