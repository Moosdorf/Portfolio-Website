import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './styles/App.css';
import Home from './pages/home.tsx';
import Navbar from './components/Navbar.tsx';
import Project from './pages/project.tsx';
import Projects from './pages/projects.tsx';
import Education from './pages/education.tsx';

function App() {

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/education" element={<Education />} />
          <Route path="/projects/:id" element={<Project />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
