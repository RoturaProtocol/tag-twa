import React, {useState, useEffect, useRef} from 'react';
import '../styles/Tags.css';
import axiosInstance from '../utils/axiosConfig';
import WebApp from '@twa-dev/sdk';
import {
    CircularProgress,
    Typography,
    Alert,
    AlertTitle,
    Button,
    Box,
    TextField,
    IconButton
} from '@mui/material';
import {Refresh, Error as ErrorIcon, ContentCopy} from '@mui/icons-material';

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
    const [xFollowButtonLoaded, setXFollowButtonLoaded] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [inviteLink, setInviteLink] = useState<string>('');
    const totalPages = 3; // Updated to include the new invite link card
    const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchUserScore();
        loadXFollowButton();
        generateInviteLink();

        autoScrollInterval.current = setInterval(() => {
            setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
        }, 5000);

        return () => {
            if (autoScrollInterval.current) {
                clearInterval(autoScrollInterval.current);
            }
        };
    }, []);

    useEffect(() => {
        const container = document.querySelector('.scrollable-cards');
        if (container) {
            container.scrollTo({
                left: currentPage * container.clientWidth,
                behavior: 'smooth'
            });
        }
    }, [currentPage]);

    const fetchUserScore = async () => {
        try {
            setLoading(true);
            setError(null);

            WebApp.ready();
            const user = WebApp.initDataUnsafe.user;

            if (!user || !user.id) {
                throw new Error('Telegram user data not available');
            }

            const tg_uid = user.id.toString();
            const response = await axiosInstance.get<UserScore>(`/user_score?tg_uid=${tg_uid}`);
            setUserScore(response.data);
        } catch (error) {
            console.error('Error fetching user score:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch user score. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadXFollowButton = () => {
        const script = document.createElement('script');
        script.src = "https://platform.twitter.com/widgets.js";
        script.charset = "utf-8";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            setXFollowButtonLoaded(true);
        };
    };

    const generateInviteLink = () => {
        const user = WebApp.initDataUnsafe.user;
        if (user && user.id) {
            setInviteLink(`https://t.me/tag_fusion_bot?start=${user.id}`);
        }
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

    const handleFollowClick = () => {
        WebApp.openTelegramLink('https://t.me/tele_tags_dao');
    };

    const handleDotClick = (index: number) => {
        setCurrentPage(index);
        if (autoScrollInterval.current) {
            clearInterval(autoScrollInterval.current);
        }
        autoScrollInterval.current = setInterval(() => {
            setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
        }, 5000);
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
                        <Typography variant="h6">Your Score: {userScore.total_score.toLocaleString()} TAGS</Typography>
                    </div>

                    <Box className="scrollable-cards-container">
                        <div className="scrollable-cards">
                            <Box className="follow-card invite-card">
                                <Typography variant="body1" className="follow-text">
                                    Invite friends and get more Tags
                                </Typography>
                                <Box className="invite-link-container">
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
                                        className="copy-button"
                                        size="small"
                                    >
                                        <ContentCopy />
                                    </IconButton>
                                </Box>
                            </Box>
                            <Box className="follow-card">
                                <Typography variant="body1" className="follow-text">
                                    Stay with us to get more rewards!
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleFollowClick}
                                    className="join-button"
                                >
                                    JOIN
                                </Button>
                            </Box>
                            <Box className="follow-card">
                                <Typography variant="body1" className="follow-text">
                                    Follow us on X for the latest updates!
                                </Typography>
                                {xFollowButtonLoaded ? (
                                    <a
                                        href="https://x.com/tagfusion0707"
                                        className="twitter-follow-button"
                                        data-size="large"
                                        data-show-count="false"
                                    >
                                        Follow
                                    </a>
                                ) : (
                                    <CircularProgress size={24}/>
                                )}
                            </Box>
                        </div>
                        <div className="pagination-dots">
                            {[...Array(totalPages)].map((_, index) => (
                                <span
                                    key={index}
                                    className={`dot ${index === currentPage ? 'active' : ''}`}
                                    onClick={() => handleDotClick(index)}
                                />
                            ))}
                        </div>
                    </Box>

                    <Typography variant="h5" className="rewards-title">Your rewards</Typography>

                    <div className="rewards-list">
                        <RewardItem icon="✨" title="Account age"
                                    amount={`${userScore.account_age_score.toLocaleString()} TAGS`}/>
                        <RewardItem icon="✅" title="Telegram Premium"
                                    amount={`${userScore.premium_score.toLocaleString()} TAGS`}/>
                        <RewardItem icon="👥" title="Invited friends"
                                    amount={`${userScore.invited_score.toLocaleString()} TAGS`}/>
                    </div>
                </>
            )}
        </div>
    );
};

export default Tags;