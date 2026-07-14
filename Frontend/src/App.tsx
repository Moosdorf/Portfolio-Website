import { Route, Routes } from 'react-router-dom';
import './styles/App.css';
import './styles/chess.css';
import Home from './pages/home.tsx';
import Navbar from './components/Navbar.tsx';
import Education from './pages/education.tsx';
import Account from './pages/account.tsx';
import ChessProject from './pages/projects/chess/chess.tsx';
import WebsiteProject from './pages/projects/fullstack_website.tsx';
import ChessFreeplay from './pages/projects/chess/chessFreeplay.tsx';
import ChessBotGame from './pages/projects/chess/chessBotGame.tsx';
import ChessPuzzle from './pages/projects/chess/chessPuzzle.tsx';

function App() {

  return (
    <>
      <Navbar />
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/education" element={<Education />} />
          <Route path="/projects/chess" element={<ChessProject />} />
          <Route path="/projects/chess/bot" element={<ChessBotGame />} />
          <Route path="/projects/chess/puzzle" element={<ChessPuzzle />} />
          <Route path="/projects/chess/freeplay" element={<ChessFreeplay />} />
          <Route path="/projects/fullstackwebsite" element={<WebsiteProject />} />
          <Route path="/account" element={<Account />} />
      </Routes>
    </>
  )
}

export default App
