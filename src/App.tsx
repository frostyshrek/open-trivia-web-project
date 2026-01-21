import { Navigate, Route, Routes } from 'react-router-dom';
import 'src/css/root/index.css'

import HomePage from 'src/pages/HomePage';
import CreateGamePage from 'src/pages/CreateGamePage';
import EditGamePage from 'src/pages/EditGamePage';
import PlayGamePage from 'src/pages/PlayGamePage';

import AnimatedBackground from 'src/components/layout/AnimatedBackground';

function App() {
  return (
    <>
      <AnimatedBackground />

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/game/new" element={<CreateGamePage />} />
        <Route path="/game/:gameId/edit" element={<EditGamePage />} />
        <Route path="/play/:gameId" element={<PlayGamePage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App

