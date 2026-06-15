import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../data/providers/AuthProvider';


function Navbar() {
    const [toggleMenu, setToggleMenu] = useState(false);
    const { amILoggedIn, user, logout } = useAuth(); 
    
    useEffect(() => {
      amILoggedIn();
    }, [])  

    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth >= 640) { {/* 640px is sm breakpoint in tailwind */}
          setToggleMenu(false);
        }
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
    
    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth >= 640) { {/* 640px is sm breakpoint in tailwind */}
          setToggleMenu(false);
        }
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
      <>
        <nav className="bg-gray-900 text-white px-6 py-4 relative">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <Link to="/" className="text-xl font-bold">picture</Link>

            {/* Nav links  ml-auto pushes them to the right */}
            <ul className="hidden sm:flex gap-6 items-center ml-auto mr-4">
              <li><Link to="/education" className="hover:text-gray-300">Education</Link></li>
              <li><Link to="/projects" className="hover:text-gray-300">Projects</Link></li>
              <li><Link to="/account" className="hover:text-gray-300">Account</Link></li>
            </ul>

            {/* Right side menu */}
            <button
              className="hover:bg-gray-700 rounded-md focus:outline-none p-2 shrink-0"
              onClick={() => setToggleMenu(!toggleMenu)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

          </div>

          
          {/* transparent overlay */}
          {toggleMenu && (
            <div className="fixed inset-0 z-40" onClick={() => setToggleMenu(false)} />
          )}

          {/* the dropdown menu */}
          <div id="dropdown"className={`border border-gray-600 rounded-md w-35 bg-gray-500 ${toggleMenu ? 'block' : 'hidden'} absolute right-5 top-full z-50 -mt-4`}>
            <ul className="py-2 p-1">
              <li onClick={() => setToggleMenu(false)}><Link to="/education" className="block py-1 hover:bg-gray-400 rounded">Education</Link></li>
              <li onClick={() => setToggleMenu(false)}><Link to="/projects" className="block py-1 hover:bg-gray-400 rounded">Projects</Link></li>
              <li onClick={() => setToggleMenu(false)}><Link to="/account" className="block py-1 hover:bg-gray-400 rounded">Account</Link></li>
              {user && <li onClick={() => setToggleMenu(false)}><Link onClick={() => logout()} to="/account" className="block border border-red-300 py-1 hover:bg-red-400 rounded">Log Out</Link></li>}
              </ul>
            </div>
        </nav>
      </>
    )
}

export default Navbar