import React, {useState, useEffect} from 'react';
import '../styles/Tags.css';
import axiosInstance from '../utils/axiosConfig';
import {
    CircularProgress,
    Typography,
    Alert,
    AlertTitle,
    Button
} from '@mui/material';
import {Refresh, Error as ErrorIcon} from '@mui/icons-material';

declare global {
    interface Window {
        Telegram: {
            WebApp: {
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

interface UserScore {
    tg_uid: string;
    total_score: number;
    account_age_score: number;
    premium_score: number;
    invited_score: number;
}

const RewardItem: React.FC<RewardItemProps> = ({icon, title, amount}) => (
    <div className="reward-item">
        <span className="icon">{icon}</span>
        <span className="title">{title}</span>
        <span className="amount">{amount}</span>
    </div>
);

const Tags: React.FC = () => {
    const [userScore, setUserScore] = useState<UserScore | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUserScore();
    }, []);

    const fetchUserScore = async () => {
        try {
            setLoading(true);
            setError(null);
            const tg_uid = window.Telegram.WebApp.initDataUnsafe.user?.id.toString();
            if (!tg_uid) {
                throw new Error('User ID not found');
            }
            const response = await axiosInstance.get<UserScore>(`/user_score?tg_uid=${tg_uid}`);
            setUserScore(response.data);
        } catch (error) {
            console.error('Error fetching user score:', error);
            setError('Failed to fetch user score. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFollowClick = () => {
        window.open('tg://resolve?domain=tagfusion', '_blank');
    };

    return (
        <div className="app">
            <header>
                <h1>TAGS <span role="img" aria-label="tag">🏷️</span></h1>
            </header>

            {loading ? (
                <div className="loading-container">
                    <CircularProgress/>
                    <Typography variant="body1">Loading your score...</Typography>
                </div>
            ) : error ? (
                <Alert
                    severity="error"
                    icon={<ErrorIcon fontSize="inherit"/>}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={fetchUserScore}
                            startIcon={<Refresh/>}
                        >
                            RETRY
                        </Button>
                    }
                >
                    <AlertTitle>Error</AlertTitle>
                    {error}
                </Alert>
            ) : !userScore ? (
                <Typography variant="body1" className="no-data-message">
                    No user data available. Please try again later.
                </Typography>
            ) : (
                <>
                    <div className="score-banner">
                        <span>Your Score: {userScore.total_score} TAGS</span>
                    </div>

                    <div className="follow-card">
                        <p>Stay updated with the latest news</p>
                        <button onClick={handleFollowClick}>Follow</button>
                    </div>

                    <h2>Your rewards</h2>

                    <div className="rewards-list">
                        <RewardItem icon="✨" title="Account age" amount={`${userScore.account_age_score} TAGS`}/>
                        <RewardItem icon="✅" title="Telegram Premium" amount={`${userScore.premium_score} TAGS`}/>
                        <RewardItem icon="👥" title="Invited friends" amount={`${userScore.invited_score} TAGS`}/>
                    </div>
                </>
            )}
        </div>
    );
};

export default Tags;