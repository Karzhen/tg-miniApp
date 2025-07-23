import React from 'react';
import { Routes, Route } from 'react-router-dom';
import GameApp from './components/GameApp.tsx';
import LeaderboardScreen from './components/LeaderboardScreen.tsx';

const App: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<GameApp />} />
            <Route path="/leaderboard" element={<LeaderboardScreen />} />
        </Routes>
    );
};

export default App;
