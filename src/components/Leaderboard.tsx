import React, {useState, useEffect} from 'react';
import {
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    CircularProgress,
    Typography,
    Button,
    Box
} from '@mui/material';
import {Refresh, Error as ErrorIcon} from '@mui/icons-material';
import InfiniteScroll from 'react-infinite-scroll-component';
import axiosInstance from '../utils/axiosConfig';
import WebApp from '@twa-dev/sdk';
import "../styles/LeaderBoard.css";

interface LeaderboardEntry {
    tg_uid: string;
    score: number;
    rank: number;
}

const Leaderboard: React.FC = () => {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [offset, setOffset] = useState<number>(0);

    useEffect(() => {
        fetchLeaderboardData();
    }, []);

    const fetchLeaderboardData = async (loadMore: boolean = false) => {
        try {
            if (!loadMore) {
                setLoading(true);
                setError(null);
            }

            WebApp.ready();
            const user = WebApp.initDataUnsafe.user;

            if (!user || !user.id) {
                throw new Error('Telegram user data not available');
            }

            const tg_uid = user.id.toString();

            // Fetch leaderboard
            const leaderboardResponse = await axiosInstance.get<LeaderboardEntry[]>(`/leaderboard?limit=10&offset=${offset}`);

            if (loadMore) {
                setLeaderboardData(prevData => [...prevData, ...leaderboardResponse.data]);
            } else {
                setLeaderboardData(leaderboardResponse.data);
            }

            setOffset(prevOffset => prevOffset + 10);
            setHasMore(leaderboardResponse.data.length === 10 && leaderboardData.length + leaderboardResponse.data.length < 200);

            // Fetch current user's rank (only on initial load)
            if (!loadMore) {
                const userRankResponse = await axiosInstance.get<LeaderboardEntry[]>(`/leaderboard?tg_uid=${tg_uid}`);
                if (userRankResponse.data.length > 0) {
                    setCurrentUserRank(userRankResponse.data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching leaderboard data:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch leaderboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const generateAvatarProps = (tg_uid: string) => {
        const initials = tg_uid.substring(0, 2).toUpperCase();
        const color = `#${parseInt(tg_uid).toString(16).padStart(6, '0').slice(-6)}`;
        return {initials, color};
    };

    const UserAvatar: React.FC<{ tg_uid: string, isCurrentUser?: boolean }> = ({tg_uid, isCurrentUser = false}) => {
        const user = WebApp.initDataUnsafe.user;
        const {initials, color} = generateAvatarProps(tg_uid);

        return (
            <Avatar
                className={isCurrentUser ? "user-avatar current-user-avatar" : "user-avatar"}
                style={{backgroundColor: color}}
                src={user && user.photo_url ? user.photo_url : undefined}
            >
                {initials}
            </Avatar>
        );
    };

    if (loading && leaderboardData.length === 0) {
        return (
            <div className="loading-container">
                <CircularProgress/>
                <Typography variant="body1">Loading leaderboard...</Typography>
            </div>
        );
    }

    if (error && leaderboardData.length === 0) {
        return (
            <div className="error-container">
                <ErrorIcon fontSize="large" color="error"/>
                <Typography variant="h6" color="error">{error}</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => fetchLeaderboardData()}
                    startIcon={<Refresh/>}
                >
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="leaderboard">
            <h1>Leaderboard</h1>
            {currentUserRank && (
                <div className="current-user-rank">
                    <UserAvatar tg_uid={currentUserRank.tg_uid} isCurrentUser={true}/>
                    <div className="user-rank-info">
                        <Box className="rank-box">
                            <Typography variant="h4" className="rank-number">#{currentUserRank.rank}</Typography>
                            <Typography variant="subtitle2" className="rank-label">YOUR RANK</Typography>
                        </Box>
                        <Box className="score-box">
                            <Typography variant="h5"
                                        className="score-number">{currentUserRank.score.toLocaleString()}</Typography>
                            <Typography variant="subtitle2" className="score-label">TAGS</Typography>
                        </Box>
                    </div>
                </div>
            )}
            <InfiniteScroll
                dataLength={leaderboardData.length}
                next={() => fetchLeaderboardData(true)}
                hasMore={hasMore}
                loader={<div className="loading-more"><CircularProgress size={24}/> Loading more...</div>}
                endMessage={<Typography variant="body2" className="end-message">You've reached the end of the
                    leaderboard</Typography>}
                scrollableTarget="leaderboard-container"
            >
                <List className="leaderboard-list">
                    {leaderboardData.map((entry) => (
                        <ListItem key={entry.tg_uid} className="leaderboard-item">
                            <ListItemAvatar>
                                <UserAvatar tg_uid={entry.tg_uid}/>
                            </ListItemAvatar>
                            <ListItemText
                                primary={`User ${entry.tg_uid}`}
                                secondary={`${entry.score.toLocaleString()} TAGS`}
                            />
                            <div className="rank-badge">#{entry.rank}</div>
                        </ListItem>
                    ))}
                </List>
            </InfiniteScroll>
        </div>
    );
};

export default Leaderboard;