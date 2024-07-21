import React from 'react';
import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Button } from '@mui/material';
import { People } from '@mui/icons-material';

interface Friend {
    name: string;
    initials: string;
    reward: number;
    color: string;
}

const friendsData: Friend[] = [
    { name: 'yulongdaren', initials: 'YU', reward: 42, color: '#2196f3' },
    { name: 'wecashid', initials: 'WE', reward: 12, color: '#ff5722' },
    // Add more friends as needed
];

const Friends: React.FC = () => {
    return (
        <div className="friends-page">
            <header>
                <h1>Friends <span role="img" aria-label="bone"></span></h1>
            </header>

            <div className="invite-banner">
                <People className="invite-icon" />
                <span>Invite</span>
            </div>

            <div className="invite-card">
                <p>Invite friends and get more Tags</p>
                <Button variant="contained" className="invite-button">Invite friends</Button>
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