import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Leaderboard from './pages/Leaderboard';
import MemberDetail from './pages/MemberDetail';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen" style={{ background: '#0f0f17' }}>
        <Sidebar />
        <main className="flex-1 ml-64 p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/member/:userId" element={<MemberDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
