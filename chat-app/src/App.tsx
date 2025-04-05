import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './components/HomePage';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import ChatRoom from './components/ChatRoom';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateRoomWrapper />} />
          <Route path="/join" element={<JoinRoomWrapper />} />
          <Route path="/chat/:roomId" element={<ChatRoomWrapper />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function CreateRoomWrapper() {
  const navigate = useNavigate();
  return (
    <CreateRoom 
      onCreate={(code, key) => navigate(`/join?room=${code}&key=${encodeURIComponent(key)}`)} 
    />
  );
}

function JoinRoomWrapper() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const roomCode = params.get('room') || '';
  const roomKey = params.get('key') || '';
  
  return (
    <JoinRoom 
      onJoin={(code, nickname, key) => {
        const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
        navigate(`/chat/${code}?nickname=${encodeURIComponent(nickname)}&color=${encodeURIComponent(color)}&key=${encodeURIComponent(key)}`);
      }} 
      initialCode={roomCode}
      initialKey={roomKey}
    />
  );
}

function ChatRoomWrapper() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const nickname = params.get('nickname') || 'Anonymous';
  const color = params.get('color') || '#666';
  const roomKey = params.get('key') || '';
  
  return (
    <ChatRoom 
      roomId={window.location.pathname.split('/chat/')[1]} 
      nickname={nickname}
      userColor={color}
      roomKey={roomKey}
      onLeave={() => navigate('/')}
    />
  );
}

export default App;