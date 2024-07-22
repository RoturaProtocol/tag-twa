import React, { useState, useEffect } from 'react';
import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Button } from '@mui/material';
import { People } from '@mui/icons-material';
import '../styles/Friends.css';

interface Friend {
    name: string;
    initials: string;
    reward: number;
    color: string;
}

const Friends: React.FC = () => {
    const [inviteLink, setInviteLink] = useState<string>('');
    const [friendsData, setFriendsData] = useState<Friend[]>([]);

    useEffect(() => {
        // Fetch friends data from your backend
        fetchFriendsData();
    }, []);

    const fetchFriendsData = async () => {
        // This should be replaced with an actual API call
        const mockData: Friend[] = [
            { name: 'yulongdaren', initials: 'YU', reward: 42, color: '#2196f3' },
            { name: 'wecashid', initials: 'WE', reward: 12, color: '#ff5722' },
        ];
        setFriendsData(mockData);
    };

    const generateInviteLink = async () => {
        // This should be replaced with an actual API call to your backend
        const userId = window.Telegram.WebApp.initDataUnsafe.user?.id;
        const mockInviteLink = `https://t.me/YourBot?start=${userId}`;
        setInviteLink(mockInviteLink);
    };

    const copyInviteLink = () => {
        navigator.clipboard.writeText(inviteLink);
        // You might want to show a notification that the link was copied
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
                {!inviteLink ? (
                    <Button variant="contained" className="invite-button" onClick={generateInviteLink}>
                        Generate Invite Link
                    </Button>
                ) : (
                    <>
                        <input type="text" value={inviteLink} readOnly className="invite-link-input" />
                        <Button variant="contained" className="invite-button" onClick={copyInviteLink}>
                            Copy Invite Link
                        </Button>
                    </>
                )}
            </div>

            <h2>Your invited friends</h2>

            <List className="friends-list">
                {friendsData.map((friend) => (
                    <ListItem key={friend.name} className="friend-item">
                        <ListItemAvatar>
                            <Avatar style={{ backgroundColor: friend.color }}>{friend.initials}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={friend.name}
                            secondary={`+${friend.reward} Tags`}
                        />
                    </ListItem>
                ))}
            </List>
        </div>
    );
};

export default Friends;