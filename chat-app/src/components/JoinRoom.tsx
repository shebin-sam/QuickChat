import { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Card, 
  CardContent, 
  Typography,
  Avatar,
  Alert,
  Collapse,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function JoinRoom({ 
  onJoin, 
  initialCode,
  initialKey
}: { 
  onJoin: (code: string, nickname: string, key: string) => void; 
  initialCode: string;
  initialKey: string;
}) {
  const [code, setCode] = useState(initialCode);
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('');
  const [roomKey, setRoomKey] = useState(initialKey);
  const [showKeyInfo, setShowKeyInfo] = useState(false);

  const generateRandomAvatar = () => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return randomColor;
  };

  const handleSetNickname = () => {
    if (!nickname.trim()) {
      alert('Please enter a nickname');
      return;
    }
    if (!code.trim()) {
      alert('Please enter a room code');
      return;
    }
    if (!roomKey.trim()) {
      alert('Please enter the room encryption key');
      return;
    }
    setAvatar(generateRandomAvatar());
    onJoin(code, nickname, roomKey);
  };

  return (
    <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>Join a Chat Room</Typography>
        
        <Collapse in={showKeyInfo}>
          <Alert 
            severity="info"
            action={
              <IconButton
                size="small"
                onClick={() => setShowKeyInfo(false)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            The encryption key should be provided by the room creator. 
            All messages are end-to-end encrypted using this key.
          </Alert>
        </Collapse>
        
        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Room Code"
            variant="outlined"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Room Encryption Key"
            variant="outlined"
            value={roomKey}
            onChange={(e) => setRoomKey(e.target.value)}
            sx={{ mb: 2 }}
            helperText={
              <span 
                style={{ cursor: 'pointer', color: '#1976d2' }}
                onClick={() => setShowKeyInfo(!showKeyInfo)}
              >
                What's this?
              </span>
            }
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: avatar || '#ccc' }}>
              {nickname.charAt(0).toUpperCase() || '?'}
            </Avatar>
            <TextField
              fullWidth
              label="Your Nickname"
              variant="outlined"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </Box>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={handleSetNickname}
          >
            Join Chat
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}