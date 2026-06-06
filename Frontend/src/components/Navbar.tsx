import { Link } from 'react-router-dom';

function Navbar() {
    return (
    <nav className="bg-gray-900 text-white px-6 py-4">
      <div className="flex items-center justify-between">

          <Link to="/" className="text-xl font-bold">picture</Link>

        <ul className="hidden md:flex gap-6">
          <li><Link to="/education" className="hover:text-gray-300">Education</Link></li>
          <li><Link to="/projects" className="hover:text-gray-300">Projects</Link></li>
        </ul>
      </div>


    </nav>
    )
}

export default Navbar