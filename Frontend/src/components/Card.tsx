import { Link } from 'react-router-dom'
import type { CardData } from '../data/CardData'


function Card(cardData: CardData) {
    return (
        <Link to={`/projects/${cardData.id}`} className="card bg-white border rounded-lg shadow-md w-50 h-50 hover:bg-blue-100 transition-shadow duration-300">
            <h2 className="text-xl font-bold mb-2">{cardData.title}</h2>
            <p className="text-gray-600">{cardData.description}</p>
        </Link>
    )
}

export default Card