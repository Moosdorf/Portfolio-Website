import { useEffect, useState } from "react"
import CardContainer from "../components/CardContainer"
import type { CardData } from "../data/CardData";

function Projects() {
  const [projects, setProjects] = useState<CardData[]>();
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
      fetch(`https://localhost:5270/api/projects`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
      }).then(data => {
        console.log(data)
        return data.json();
      }).then(raw => {
        console.log(raw.result)
        setProjects(raw.result)
        setFetching(false);
      })

  }, [])

    
    if (fetching) {
        return (
        <div className="projects-page p-5">
          <h1>Loading</h1>
        </div>
        )
    }

  return (
    <div className="projects-page p-5">
      <h1>Projects</h1>
      <CardContainer projects={projects}/>
    </div>
  )
}


export default Projects