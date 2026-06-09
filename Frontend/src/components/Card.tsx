import { Link } from 'react-router-dom'
import type { CardData } from '../data/CardData'
import { useEffect, useState } from 'react';


function Card(cardData: CardData) {
    const [showDescription, setShowDescription] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 640) { {/* 640px is sm breakpoint in tailwind */}
                setShowDescription(false);
            } else {
                setShowDescription(true);
            }
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <Link to={`/projects/${cardData.id}`} className="card bg-white border rounded-lg shadow-md p-4
                         w-full
                         sm:w-64
                         hover:bg-blue-100 transition-shadow duration-300">
            <h2 className="text-xl font-bold mb-2">{cardData.title}</h2>
            {showDescription && <p className="text-gray-600">{cardData.description}</p>}
        </Link>
    )
}

export default Card