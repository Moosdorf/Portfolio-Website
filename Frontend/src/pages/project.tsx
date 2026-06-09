import { useParams } from "react-router-dom";

function Project() {
    let { id }= useParams(); // "id" must match the ":id" in the route path
    console.log(id);
   
    return (
        <div>
            <h1>Project {id}</h1>
        </div>
    )
}

export default Project