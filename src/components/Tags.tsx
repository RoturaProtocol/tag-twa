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
    const [isPaused, setIsPaused] = useState(false);
    const [inviteLink, setInviteLink] = useState<string>('');
    const totalPages = 3;
    const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);
    const scrollIntervalDuration = 8000; // 8 seconds
    const scrollableRef = useRef<HTMLDivElement>(null);
    const startX = useRef<number>(0);
    const currentX = useRef<number>(0);

    useEffect(() => {
        fetchUserScore();
        loadXFollowButton();
        generateInviteLink();
        startAutoScroll();

        return () => {
            if (autoScrollInterval.current) {
                clearInterval(autoScrollInterval.current);
            }
        };
    }, []);

    const startAutoScroll = () => {
        if (autoScrollInterval.current) {
            clearInterval(autoScrollInterval.current);
        }
        autoScrollInterval.current = setInterval(() => {
            if (!isPaused) {
                setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
            }
        }, scrollIntervalDuration);
    };

    useEffect(() => {
        if (scrollableRef.current) {
            scrollableRef.current.scrollTo({
                left: currentPage * scrollableRef.current.clientWidth,
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

    const handleInviteLinkFocus = () => {
        setIsPaused(true);
    };

    const handleInviteLinkBlur = () => {
        setIsPaused(false);
        startAutoScroll();
    };

    const copyInviteLink = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink)
                .then(() => {
                    WebApp.showAlert('Invite link copied to clipboard!');
                    setIsPaused(false);
                    startAutoScroll();
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
        setIsPaused(false);
        startAutoScroll();
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        setIsPaused(true);
        startX.current = e.touches[0].clientX;
        currentX.current = startX.current;
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!scrollableRef.current) return;
        const touchX = e.touches[0].clientX;
        const diff = currentX.current - touchX;
        scrollableRef.current.scrollLeft += diff;
        currentX.current = touchX;
    };

    const handleTouchEnd = () => {
        if (!scrollableRef.current) return;
        const newPage = Math.round(scrollableRef.current.scrollLeft / scrollableRef.current.clientWidth);
        setCurrentPage(newPage);
        setIsPaused(false);
        startAutoScroll();
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsPaused(true);
        startX.current = e.clientX;
        currentX.current = startX.current;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!scrollableRef.current) return;
        const diff = currentX.current - e.clientX;
        scrollableRef.current.scrollLeft += diff;
        currentX.current = e.clientX;
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        if (!scrollableRef.current) return;
        const newPage = Math.round(scrollableRef.current.scrollLeft / scrollableRef.current.clientWidth);
        setCurrentPage(newPage);
        setIsPaused(false);
        startAutoScroll();
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
                        <div
                            className="scrollable-cards"
                            ref={scrollableRef}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            onMouseDown={handleMouseDown}
                        >
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
                                        onFocus={handleInviteLinkFocus}
                                        onBlur={handleInviteLinkBlur}
                                        size="small"
                                    />
                                    <IconButton
                                        onClick={copyInviteLink}
                                        className="copy-button"
                                        size="small"
                                    >
                                        <ContentCopy/>
                                    </IconButton>
                                </Box>
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