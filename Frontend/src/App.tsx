import { Route, Routes } from 'react-router-dom';
import './styles/App.css';
import './styles/chess.css';
import Home from './pages/home.tsx';
import Navbar from './components/Navbar.tsx';
import Projects from './pages/projects.tsx';
import Education from './pages/education.tsx';
import Account from './pages/account.tsx';
import ChessProject from './pages/projects/chess/chess.tsx';
import WebsiteProject from './pages/projects/fullstack_website.tsx';

function App() {

  return (
    <>
      <Navbar />
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/education" element={<Education />} />
          <Route path="/projects/chess" element={<ChessProject />} />
          <Route path="/projects/fullstackwebsite" element={<WebsiteProject />} />
          <Route path="/account" element={<Account />} />
      </Routes>
    </>
  )
}

export default App
