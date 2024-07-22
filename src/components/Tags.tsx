import React, {useState, useEffect} from 'react';
import '../styles/Tags.css';

declare global {
    interface Window {
        Telegram: {
            WebApp: {
                openLink: (url: string) => void;
                initDataUnsafe: {
                    user?: {
                        id: number;
                        first_name: string;
                        last_name?: string;
                        username?: string;
                        language_code?: string;
                        is_premium?: boolean;
                    };
                };
            };
        };
    }
}

interface RewardItemProps {
    icon: string;
    title: string;
    amount: string;
}

const RewardItem: React.FC<RewardItemProps> = ({icon, title, amount}) => (
    <div className="reward-item">
        <span className="icon">{icon}</span>
        <span className="title">{title}</span>
        <span className="amount">{amount}</span>
    </div>
);

const Tags: React.FC = () => {
    const [accountAge, setAccountAge] = useState<number>(0);
    const [isPremium, setIsPremium] = useState<boolean>(false);
    const [invitedFriendsScore, setInvitedFriendsScore] = useState<number>(0);
    const [totalScore, setTotalScore] = useState<number>(0);

    useEffect(() => {
        // Fetch user data from Telegram Web App
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        if (user) {
            setAccountAge(Math.floor(user.id / 10000000)); // Rough estimate
            setIsPremium(user.is_premium || false);
        }

        // Fetch invited friends score from your backend
        fetchInvitedFriendsScore();
    }, []);

    useEffect(() => {
        // Calculate total score
        const ageScore = accountAge * 10; // 10 points per estimated year
        const premiumScore = isPremium ? 1000 : 0;

        setTotalScore(ageScore + premiumScore + invitedFriendsScore);
    }, [accountAge, isPremium, invitedFriendsScore]);

    const fetchInvitedFriendsScore = async () => {
        // This should be replaced with an actual API call to your backend
        // For now, we'll use a mock value
        const mockScore = 84;
        setInvitedFriendsScore(mockScore);
    };

    const handleFollowClick = () => {
        window.Telegram.WebApp.openLink('https://t.me/tagfusion');
    };

    return (
        <div className="app">
            <header>
                <h1>TAGS <span role="img" aria-label="tag">🏷️</span></h1>
            </header>

            <div className="score-banner">
                <span>Your Score: {totalScore} TAGS</span>
            </div>

            <div className="follow-card">
                <p>Stay updated with the latest news</p>
                <button onClick={handleFollowClick}>Follow</button>
            </div>

            <h2>Your rewards</h2>

            <div className="rewards-list">
                <RewardItem icon="✨" title="Account age" amount={`${accountAge * 10} TAGS`}/>
                <RewardItem icon="✅" title="Telegram Premium" amount={isPremium ? "1000 TAGS" : "0 TAGS"}/>
                <RewardItem icon="👥" title="Invited friends" amount="84 TAGS"/>
            </div>
        </div>
    );
};

export default Tags;