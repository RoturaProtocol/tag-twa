import React from 'react';
import { Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import "../styles/LeaderBoaed.css"


interface LeaderboardEntry {
    name: string;
    score: number;
    rank: number;
    initials: string;
    color: string;
}

const leaderboardData: LeaderboardEntry[] = [
    { name: 'cykablyatputo', score: 4657, rank: 4042176, initials: 'CY', color: '#9c27b0' },
    { name: 'glebtma', score: 16204503, rank: 1, initials: 'GL', color: '#8e24aa' },
    { name: 'Esalat', score: 13060907, rank: 2, initials: 'ES', color: '#2196f3' },
    { name: 'mohamahamed', score: 10323187, rank: 3, initials: 'MO', color: '#4caf50' },
    { name: 'SOGpopbrc', score: 8758653, rank: 4, initials: 'SO', color: '#03a9f4' },
];

const Leaderboard: React.FC = () => {
    return (
        <div className="leaderboard">
            <h1>Telegram Tags Leaderboard</h1>
            <div className="top-holder">
                <Avatar className="avatar" style={{ backgroundColor: leaderboardData[0].color }}>
                    {leaderboardData[0].initials}
                </Avatar>
                <div className="holder-info">
                    <div className="holder-name">{leaderboardData[0].name}</div>
                    <div className="holder-score">{leaderboardData[0].score.toLocaleString()} TAGS</div>
                </div>
                <div className="holder-rank">#{leaderboardData[0].rank}</div>
            </div>
            <div className="holders-count">22M holders</div>
            <List className="leaderboard-list">
                {leaderboardData.slice(1).map((entry, index) => (
                    <ListItem key={entry.name} className="leaderboard-item">
                        <ListItemAvatar>
                            <Avatar style={{ backgroundColor: entry.color }}>{entry.initials}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={entry.name}
                            secondary={`${entry.score.toLocaleString()} TAGS`}
                        />
                        <div className="rank-badge">{index + 1}</div>
                    </ListItem>
                ))}
            </List>
        </div>
    );
};

export default Leaderboard;