import React, { useState, useEffect } from 'react';
import '../styles/Friends.css'; // Importing CSS file

// Define the structure of a Friend object
interface Friend {
    id: string;
    name: string;
}

const Friends: React.FC = () => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [inviteLink, setInviteLink] = useState<string>('');

    useEffect(() => {
        // Fetch friends from the backend (replace with your actual API call)
        const fetchFriends = async () => {
            // Dummy data, replace with API call
            const friendsData: Friend[] = [
                { id: '1', name: 'Alice' },
                { id: '2', name: 'Bob' },
                { id: '3', name: 'Charlie' },
            ];
            setFriends(friendsData);
        };

        fetchFriends();
    }, []);

    const generateInviteLink = () => {
        // Replace with actual logic to generate an invite link
        const link = 'https://your-invite-link.com';
        setInviteLink(link);
    };

    return (
        <div className="friends">
            <h1>Friends</h1>
            <ul className="friends-list">
                {friends.map((friend) => (
                    <li key={friend.id} className="friend-item">
                        <div className="friend-info">
                            <span className="friend-name">{friend.name}</span>
                        </div>
                    </li>
                ))}
            </ul>
            <button className="invite-button" onClick={generateInviteLink}>Show Invite Link</button>
            {inviteLink && (
                <div className="invite-link">
                    <p>Invite Link: {inviteLink}</p>
                </div>
            )}
        </div>
    );
};

export default Friends;
