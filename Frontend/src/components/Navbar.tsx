import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    const [toggleMenu, setToggleMenu] = useState(false);

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
        <nav className="bg-gray-900 text-white px-6 py-4 relative">  {/*relative so i can put the dropdown menu as absolute*/}
          <div className="flex items-center justify-between">
            {/* home for navbar */}
            <Link to="/" className="text-xl font-bold">picture</Link>

            {/* navigation links */}
            <ul className="hidden sm:flex gap-6">
              <li><Link to="/education" className="hover:text-gray-300">Education</Link></li>
              <li><Link to="/projects" className="hover:text-gray-300">Projects</Link></li>
            </ul>

            {/* menu if too small screen for same links */}
            <button className="sm:hidden hover:bg-gray-700 rounded-md focus:outline-none p-2" onClick={() => setToggleMenu(!toggleMenu)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>

          {/* transparent overlay */}
          {toggleMenu && (
            <div className="fixed inset-0 z-40" onClick={() => setToggleMenu(false)} />
          )}

          {/* the dropdown menu */}
          <div id="dropdown"className={`border border-gray-600 rounded-md w-35 bg-gray-500 sm:hidden ${toggleMenu ? 'block' : 'hidden'} absolute right-5 top-full z-50 -mt-4`}>
            <ul className="py-2">
              <li onClick={() => setToggleMenu(false)}><Link to="/education" className="block py-1 hover:bg-gray-400 rounded">Education</Link></li>
              <li onClick={() => setToggleMenu(false)}><Link to="/projects" className="block py-1 hover:bg-gray-400 rounded">Projects</Link></li>
              </ul>
            </div>
        </nav>
      </>
    )
}

export default Navbar