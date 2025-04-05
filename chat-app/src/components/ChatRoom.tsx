import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import CryptoJS from 'crypto-js';
import { 
  Box, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemAvatar,
  ListItemText, 
  Avatar, 
  Typography, 
  Paper,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
  Tooltip,
  Alert,
  Collapse
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

interface Message {
  id: string;
  text: string;
  sender: string;
  senderColor: string;
  timestamp: number;
  encryptedMessage?: string;
  iv?: string;
  isEncrypted?: boolean;
}

interface User {
  id: string;
  nickname: string;
  color: string;
}

interface ServerToClientEvents {
  message: (msg: Omit<Message, 'text'> & { encryptedMessage: string; iv: string }) => void;
  currentUsers: (users: User[]) => void;
  userJoined: (user: User) => void;
  userLeft: (userId: string) => void;
}

interface ClientToServerEvents {
  joinRoom: (data: { roomId: string; nickname: string; color: string }) => void;
  sendMessage: (data: { roomId: string; encryptedMessage: string; iv: string }) => void;
}

export default function ChatRoom({ 
  roomId, 
  nickname,
  userColor,
  roomKey,
  onLeave 
}: { 
  roomId: string, 
  nickname: string,
  userColor: string,
  roomKey: string,
  onLeave: () => void 
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const encryptMessage = (message: string): { encryptedMessage: string; iv: string } => {
    // Ensure the key is properly formatted (32 bytes for AES-256)
    const key = CryptoJS.enc.Utf8.parse(roomKey.padEnd(32, ' ').slice(0, 32));
    
    // Generate random IV
    const iv = CryptoJS.lib.WordArray.random(128/8); // 16 bytes for AES-CBC
    
    // Encrypt the message
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(message),
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    
    return {
      encryptedMessage: encrypted.toString(),
      iv: iv.toString(CryptoJS.enc.Hex)
    };
  };

  const decryptMessage = (encryptedMessage: string, iv: string): string => {
    console.log(encryptedMessage);
    try {
      // Ensure the key is properly formatted (32 bytes for AES-256)
      const key = CryptoJS.enc.Utf8.parse(roomKey.padEnd(32, ' ').slice(0, 32));
      
      // Parse the IV from hex string
      const ivBytes = CryptoJS.enc.Hex.parse(iv);
      console.log(ivBytes);
      // Decrypt the message
      const decrypted = CryptoJS.AES.decrypt(
        encryptedMessage,
        key,
        {
          iv: ivBytes,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      
      // Convert to UTF-8 string
      return decrypted.toString(CryptoJS.enc.Utf8) || '[Empty message]';
    } catch (e) {
      console.error('Decryption error:', e);
      return '[Unable to decrypt message]';
    }
  };
  // Connect to Socket.io server
  useEffect(() => {
    const socketInstance = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
      
      socketInstance.emit('joinRoom', { 
        roomId, 
        nickname, 
        color: userColor 
      });
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    socketInstance.on('message', (msg) => {
      const decryptedText = msg.sender === 'System' 
        ? msg.text 
        : decryptMessage(msg.encryptedMessage, msg.iv);

      const message: Message = {
        id: msg.id,
        text: decryptedText,
        sender: msg.sender,
        senderColor: msg.senderColor,
        timestamp: msg.timestamp,
        encryptedMessage: msg.encryptedMessage,
        iv: msg.iv,
        isEncrypted: msg.sender !== 'System'
      };
      
      setMessages(prev => [...prev, message]);
    });

    socketInstance.on('currentUsers', (usersList: User[]) => {
      setUsers(usersList);
    });

    socketInstance.on('userJoined', (user: User) => {
      setUsers(prev => [...prev, user]);
      setMessages(prev => [...prev, {
        id: `join-${user.id}-${Date.now()}`,
        text: `${user.nickname} joined the chat`,
        sender: 'System',
        senderColor: '#666',
        timestamp: Date.now()
      }]);
    });

    socketInstance.on('userLeft', (userId: string) => {
      const leavingUser = users.find(u => u.id === userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      
      if (leavingUser) {
        setMessages(prev => [...prev, {
          id: `left-${userId}-${Date.now()}`,
          text: `${leavingUser.nickname} left the chat`,
          sender: 'System',
          senderColor: '#666',
          timestamp: Date.now()
        }]);
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [roomId, nickname, userColor, roomKey]);

  const handleSendMessage = () => {
    if (newMessage.trim() && socket) {
      const { encryptedMessage, iv } = encryptMessage(newMessage);
      
      socket.emit('sendMessage', { 
        roomId, 
        encryptedMessage,
        iv
      });
      
      // Optimistically add to local state
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: nickname,
        senderColor: userColor,
        timestamp: Date.now(),
        isEncrypted: false
      };
      
    //   setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.disconnect();
    }
    onLeave();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isConnected) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress />
        <Typography>Connecting to chat room...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #333',
        bgcolor: 'background.paper',
        zIndex: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">Room: {roomId}</Typography>
          <Tooltip title="Security Info">
            <IconButton onClick={() => setShowSecurityInfo(!showSecurityInfo)} size="small">
              <SecurityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            avatar={<Avatar sx={{ bgcolor: userColor }}>{nickname.charAt(0)}</Avatar>}
            label={`You: ${nickname}`}
            variant="outlined"
          />
          <Button 
            variant="outlined" 
            color="secondary" 
            size="small"
            onClick={handleLeaveRoom}
          >
            Leave
          </Button>
        </Box>
      </Box>

      <Collapse in={showSecurityInfo}>
        <Alert 
          severity="info"
          icon={<InfoIcon />}
          action={
            <IconButton
              size="small"
              onClick={() => setShowSecurityInfo(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 1 }}
        >
          <Typography variant="body2">
            This room uses end-to-end encryption. Messages are encrypted with AES-256 before leaving your device and can only be decrypted by users with the room key.
          </Typography>
        </Alert>
      </Collapse>
      
      {/* Online Users */}
      <Box sx={{ 
        p: 1, 
        borderBottom: '1px solid #333',
        display: 'flex', 
        gap: 1, 
        overflowX: 'auto',
        bgcolor: 'background.default'
      }}>
        <Typography variant="body2" sx={{ alignSelf: 'center' }}>Online: {users.length}</Typography>
        {users.map(user => (
          <Chip
            key={user.id}
            avatar={<Avatar sx={{ 
              bgcolor: user.color,
              width: 24, 
              height: 24,
              fontSize: '0.75rem'
            }}>
              {user.nickname.charAt(0)}
            </Avatar>}
            label={user.nickname}
            size="small"
            variant={user.nickname === nickname ? 'filled' : 'outlined'}
          />
        ))}
      </Box>
      
      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: 'background.default' }}>
        <List sx={{ width: '100%' }}>
          {messages.map((message) => (
            <ListItem 
              key={message.id} 
              sx={{ 
                justifyContent: message.sender === nickname ? 'flex-end' : 'flex-start',
                px: 0,
                py: 1
              }}
            >
              <Box sx={{ 
                display: 'flex',
                flexDirection: message.sender === nickname ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: 1,
                maxWidth: '80%'
              }}>
                {message.sender !== nickname && message.sender !== 'System' && (
                  <Tooltip title={message.sender}>
                    <Avatar sx={{ 
                      bgcolor: message.senderColor,
                      width: 32, 
                      height: 32,
                      fontSize: '0.875rem'
                    }}>
                      {message.sender.charAt(0)}
                    </Avatar>
                  </Tooltip>
                )}
                <Paper sx={{ 
                  p: 1.5,
                  bgcolor: message.sender === nickname ? 'primary.main' : 
                          message.sender === 'System' ? 'grey.800' : 'background.paper',
                  color: message.sender === nickname ? 'primary.contrastText' : 
                        message.sender === 'System' ? 'grey.300' : 'text.primary',
                  borderRadius: message.sender === nickname ? 
                    '18px 18px 4px 18px' : 
                    '18px 18px 18px 4px',
                  border: message.sender === 'System' ? '1px solid #444' : 'none'
                }}>
                  {message.sender !== nickname && message.sender !== 'System' && (
                    <Typography variant="caption" sx={{ 
                      display: 'block',
                      fontWeight: 'bold',
                      color: message.senderColor
                    }}>
                      {message.sender}
                    </Typography>
                  )}
                  <Typography sx={{ wordBreak: 'break-word' }}>{message.text}</Typography>
                  <Typography variant="caption" sx={{ 
                    display: 'block',
                    textAlign: 'right',
                    opacity: 0.7,
                    mt: 0.5
                  }}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Paper>
              </Box>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>
      
      {/* Message Input */}
      <Box sx={{ p: 2, borderTop: '1px solid #333', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            size="small"
            multiline
            maxRows={4}
          />
          <Tooltip title="Send message">
            <span>
              <IconButton 
                color="primary" 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <SendIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}