import React, { useState, useEffect } from 'react';
import {
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Button,
    Typography,
    CircularProgress,
    Alert,
    AlertTitle,
    Chip,
    TextField,
    Box,
    Paper,
    IconButton
} from '@mui/material';
import { People, Refresh, Error as ErrorIcon, ContentCopy } from '@mui/icons-material';
import axiosInstance from '../utils/axiosConfig';
import WebApp from '@twa-dev/sdk';
import '../styles/Friends.css';

interface Friend {
    tg_uid: string;
    score: number;
    level: number;
}

const Friends: React.FC = () => {
    const [friendsData, setFriendsData] = useState<Friend[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [inviteLink, setInviteLink] = useState<string>('');

    useEffect(() => {
        fetchFriendsData();
        generateInviteLink();
    }, []);

    const fetchFriendsData = async () => {
        try {
            setLoading(true);
            setError(null);
            WebApp.ready();
            // const user = WebApp.initDataUnsafe.user;
            // if (!user || !user.id) {
            //     throw new Error('Telegram user data not available');
            // }
            // const tg_uid = user.id.toString();
            const tg_uid = 1061407990;
            const response = await axiosInstance.get<Friend[]>(`/invited_friends?tg_uid=${tg_uid}`);
            setFriendsData(response.data);
        } catch (error) {
            console.error('Error fetching friends data:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch friends data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const generateInviteLink = () => {
        const user = WebApp.initDataUnsafe.user;
        if (user && user.id) {
            setInviteLink(`https://t.me/tag_fusion_bot?start=${user.id}`);
        }
        setInviteLink(`https://t.me/tag_fusion_bot?start=1061407990`);
    };

    const copyInviteLink = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink)
                .then(() => {
                    WebApp.showAlert('Invite link copied to clipboard!');
                })
                .catch((err) => {
                    console.error('Failed to copy: ', err);
                    WebApp.showAlert('Failed to copy. Please copy the link manually.');
                });
        }
    };

    const generateAvatarProps = (tg_uid: string) => {
        const initials = tg_uid.substring(0, 2).toUpperCase();
        const color = `#${parseInt(tg_uid).toString(16).padStart(6, '0').slice(-6)}`;
        return { initials, color };
    };

    const getLevelColor = (level: number) => {
        switch (level) {
            case 1: return '#2196f3'; // blue
            case 2: return '#9c27b0'; // purple
            case 3: return '#4caf50'; // green
            default: return '#757575'; // grey
        }
    };

    return (
        <div className="friends-page">
            <Typography variant="h4" component="h1" gutterBottom className="page-title">
                Friends <span role="img" aria-label="friends">👥</span>
            </Typography>

            <Paper elevation={3} className="invite-section">
                <Box className="invite-banner">
                    <People className="invite-icon" />
                    <Typography variant="h6" className="invite-title">Invite</Typography>
                </Box>

                <Box p={2}>
                    <Typography variant="body1" gutterBottom className="invite-text">
                        Invite friends and get more Tags
                    </Typography>
                    <Box display="flex" alignItems="center" mb={1}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            value={inviteLink}
                            InputProps={{
                                readOnly: true,
                                className: "invite-link-input"
                            }}
                            size="small"
                        />
                        <IconButton
                            onClick={copyInviteLink}
                            color="primary"
                            disabled={loading}
                            sx={{ ml: 1 }}
                            className="copy-button"
                        >
                            <ContentCopy />
                        </IconButton>
                    </Box>
                    <Typography variant="caption" className="invite-caption">
                        Share this link with your friends to invite them!
                    </Typography>
                </Box>
            </Paper>

            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 3 }} className="section-title">
                Your invited friends
            </Typography>

            {loading ? (
                <Box display="flex" flexDirection="column" alignItems="center" my={4}>
                    <CircularProgress />
                    <Typography variant="body1" mt={2} className="loading-text">Loading your friends list...</Typography>
                </Box>
            ) : error ? (
                <Alert
                    severity="error"
                    icon={<ErrorIcon fontSize="inherit" />}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={fetchFriendsData}
                            startIcon={<Refresh />}
                        >
                            RETRY
                        </Button>
                    }
                >
                    <AlertTitle>Error</AlertTitle>
                    {error}
                </Alert>
            ) : friendsData.length > 0 ? (
                <List className="friends-list">
                    {friendsData.map((friend) => {
                        const { initials, color } = generateAvatarProps(friend.tg_uid);
                        return (
                            <ListItem key={friend.tg_uid} className="friend-item">
                                <ListItemAvatar>
                                    <Avatar style={{ backgroundColor: color }}>{initials}</Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={<span className="friend-name">User {friend.tg_uid}</span>}
                                    secondary={<span className="friend-score">+{friend.score} Tags</span>}
                                />
                                <Chip
                                    label={`Level ${friend.level}`}
                                    style={{
                                        backgroundColor: getLevelColor(friend.level),
                                        color: '#ffffff'
                                    }}
                                    size="small"
                                />
                            </ListItem>
                        );
                    })}
                </List>
            ) : (
                <Typography variant="body1" className="no-friends-message">
                    You haven't invited any friends yet. Share your invite link to get started!
                </Typography>
            )}
        </div>
    );
};

export default Friends;