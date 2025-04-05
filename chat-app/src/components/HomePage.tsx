import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Divider,
  Grid,
  Paper,
  Avatar,
  useTheme
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import LockIcon from '@mui/icons-material/Lock';

export default function HomePage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar sx={{ 
          bgcolor: theme.palette.primary.main, 
          width: 80, 
          height: 80,
          mx: 'auto',
          mb: 2
        }}>
          <ChatIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to QuickChat
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Simple, secure, and ephemeral chat rooms
        </Typography>
      </Box>

      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent sx={{ p: 0 }}>
          <Grid container>
            <Grid size={{xs:12, md:6}}>
              <Box 
                sx={{ 
                  p: 3, 
                  bgcolor: activeTab === 'create' ? 'action.selected' : 'transparent',
                  cursor: 'pointer',
                  height: '100%'
                }}
                onClick={() => setActiveTab('create')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <GroupAddIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Create Room</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Start a new chat room and invite others
                </Typography>
              </Box>
            </Grid>
            <Grid size={{xs:12, md:6}}>
              <Box 
                sx={{ 
                  p: 3, 
                  bgcolor: activeTab === 'join' ? 'action.selected' : 'transparent',
                  cursor: 'pointer',
                  height: '100%'
                }}
                onClick={() => setActiveTab('join')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LockIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Join Room</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Enter an existing room with a code
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Divider />
          
          <Box sx={{ p: 4 }}>
            {activeTab === 'create' ? (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Ready to start chatting?
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Create a private room and share the code with your friends.
                </Typography>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/create')}
                  sx={{ minWidth: 200 }}
                >
                  Create Room
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Join an existing room
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Enter the room code provided by your friend.
                </Typography>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/join')}
                  sx={{ minWidth: 200 }}
                >
                  Join Room
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{xs:12, md:6}}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Avatar sx={{ bgcolor: 'success.light', mb: 2 }}>
              <ChatIcon />
            </Avatar>
            <Typography variant="h6" gutterBottom>Real-time Chat</Typography>
            <Typography variant="body2">
              Messages are delivered instantly to everyone in the room.
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{xs:12, md:6}}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Avatar sx={{ bgcolor: 'warning.light', mb: 2 }}>
              <LockIcon />
            </Avatar>
            <Typography variant="h6" gutterBottom>No Storage</Typography>
            <Typography variant="body2">
              All messages are ephemeral and disappear when the room is closed.
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{xs:12, md:6}}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Avatar sx={{ bgcolor: 'info.light', mb: 2 }}>
              <GroupAddIcon />
            </Avatar>
            <Typography variant="h6" gutterBottom>Easy Sharing</Typography>
            <Typography variant="body2">
              Just share the room code - no accounts or passwords needed.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}