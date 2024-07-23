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
    AlertTitle
} from '@mui/material';
import { People, Refresh } from '@mui/icons-material';
import axiosInstance from '../utils/axiosConfig';
import '../styles/Friends.css';

interface Friend {
    tg_uid: string;
    score: number;
}

const Friends: React.FC = () => {
    const [friendsData, setFriendsData] = useState<Friend[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFriendsData();
    }, []);

    const fetchFriendsData = async () => {
        try {
            setLoading(true);
            setError(null);
            const tg_uid = window.Telegram.WebApp.initDataUnsafe.user?.id.toString();
            const response = await axiosInstance.get<Friend[]>(`/invited_friends?tg_uid=${tg_uid}`);
            setFriendsData(response.data);
        } catch (error) {
            console.error('Error fetching friends data:', error);
            setError('Failed to fetch friends data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getInviteLink = () => {
        const tg_uid = window.Telegram.WebApp.initDataUnsafe.user?.id.toString();
        return `https://t.me/tag_fusion_bot?start=${tg_uid}`;
    };

    const copyInviteLink = () => {
        const inviteLink = getInviteLink();
        navigator.clipboard.writeText(inviteLink);
        // You might want to show a notification that the link was copied
    };

    const generateAvatarProps = (tg_uid: string) => {
        const initials = tg_uid.substring(0, 2).toUpperCase();
        const color = `#${parseInt(tg_uid).toString(16).padStart(6, '0').slice(-6)}`;
        return { initials, color };
    };

    return (
        <div className="friends-page">
            <header>
                <h1>Friends <span role="img" aria-label="friends">👥</span></h1>
            </header>

            <div className="invite-banner">
                <People className="invite-icon" />
                <span>Invite</span>
            </div>

            <div className="invite-card">
                <p>Invite friends and get more Tags</p>
                <Button
                    variant="contained"
                    className="invite-button"
                    onClick={copyInviteLink}
                    disabled={loading}
                >
                    Copy Invite Link
                </Button>
            </div>

            <h2>Your invited friends</h2>

            {loading ? (
                <div className="loading-container">
                    <CircularProgress />
                    <Typography variant="body1">Loading your friends list...</Typography>
                </div>
            ) : error ? (
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={fetchFriendsData}>
                            <Refresh /> Retry
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
                                    primary={`User ${friend.tg_uid}`}
                                    secondary={`+${friend.score} Tags`}
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