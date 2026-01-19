import { Navigate, Route, Routes } from 'react-router-dom';
import 'src/css/root/index.css'
import HomePage from 'src/pages/HomePage';


import AnimatedBackground from 'src/components/layout/AnimatedBackground';

function App() {
  return (
    <>
      <AnimatedBackground />

      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* <Route path="/game/new" element={<CreateGamePage />} />
        <Route path="/game/:gameId/edit" element={<EditGamePage />} />
        <Route path="/play/:gameId" element={<PlayGamePage />} /> */}

        {/* optional: redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App

