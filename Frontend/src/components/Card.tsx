import { Link } from 'react-router-dom'
import type { CardData } from '../data/CardData'
import { useEffect, useState } from 'react';

function Card(cardData: CardData) {
    const [showDescription, setShowDescription] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            setShowDescription(window.innerWidth > 640);
        }
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);



    return (
        <Link 
            to={`/projects/${cardData.id}`} 
            className="group relative bg-gray-900 border border-gray-700 rounded-xl p-6
                    w-full sm:w-64
                    hover:border-blue-500
                    transition-all duration-300 ease-out"
                    title={cardData.description}
        >
            <h2 className="text-white font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors duration-200">
                {cardData.title}
            </h2>

            {showDescription && (
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                    {cardData.description}
                </p>
            )}

            <span className="inline-block mt-4 text-xs text-blue-400 font-medium tracking-wide uppercase">
                View project →
            </span>
        </Link>
    )
}

export default Card