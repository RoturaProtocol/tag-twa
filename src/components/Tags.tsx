import React from 'react';
import '../styles/Tags.css';


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

    return (
        <div className="app">
            <header>
                <h1>TAGS <span role="img"></span></h1>
            </header>

            <div className="score-banner">
                <span>Your Score</span>
            </div>

            <div className="follow-card">
                <p>Stay updated with the latest news</p>
                <button>Follow</button>
            </div>

            <h2>Your rewards</h2>

            <div className="rewards-list">
                <RewardItem icon="✨" title="Account age" amount="3,573 TAGS"/>
                <RewardItem icon="✅" title="Telegram Premium" amount="0"/>
                <RewardItem icon="👥" title="Invited friends" amount="84 TAGS"/>
                <RewardItem icon="✨" title="Connect Wallet" amount="1,000 TAGS"/>
            </div>

        </div>
    );
};

export default Tags;