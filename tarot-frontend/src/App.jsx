import React, { useState } from 'react';
import './App.css';
import ClassicTarot from './ClassicTarot'; // Import trang cổ điển
import ChatTarot from './ChatTarot';       // Import trang trò chuyện

export default function App() {
  const [currentPage, setCurrentPage] = useState('chat'); // Mặc định hiển thị trang chat

  return (
    <div className="app-container">
      <header className="header">
        <h1>🔮 Tarot AI</h1>
      </header>
      
      <nav className="main-navbar">
        <div className="navbar-buttons">
          <button
            onClick={() => setCurrentPage('classic')}
            className={`button ${currentPage === 'classic' ? 'primary' : ''}`}
          >
            Trải Bài Cổ Điển
          </button>
          <button
            onClick={() => setCurrentPage('chat')}
            className={`button ${currentPage === 'chat' ? 'primary' : ''}`}
          >
            Trò Chuyện AI
          </button>
        </div>
      </nav>

      {currentPage === 'classic' && <ClassicTarot />}
      {currentPage === 'chat' && <ChatTarot />}
    </div>
  );
}
