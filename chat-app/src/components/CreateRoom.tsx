import { useState } from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import CryptoJS from 'crypto-js';
export default function CreateRoom({ onCreate }: { onCreate: (roomName: string, roomKey: string) => void }) {
  const [roomName, setRoomName] = useState('');
  const [roomKey, setRoomKey] = useState('');

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const generateRoomKey = () => {
    return CryptoJS.lib.WordArray.random(32).toString();
  };

  const handleCreate = () => {
    const code = generateRoomCode();
    const key = generateRoomKey();
    setRoomName(code);
    setRoomKey(key);
    onCreate(code, key);
  };

  return (
    <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>Create a Chat Room</Typography>
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={handleCreate}
            size="large"
          >
            Generate Room Code
          </Button>
        </Box>
        {roomName && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body1">Share this code to invite others:</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>{roomName}</Typography>
            <Typography variant="body2" sx={{ mt: 2, wordBreak: 'break-all' }}>
              Encryption Key: {roomKey}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              (Share this key securely with participants)
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}