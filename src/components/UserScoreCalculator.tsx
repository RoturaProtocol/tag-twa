import React, { useEffect, useState } from 'react';
import { getTelegramWebApp } from '../utils/telegram';

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

const UserScoreCalculator: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const WebApp = getTelegramWebApp();

    WebApp.ready();

    const user = WebApp.initDataUnsafe.user;
    if (user) {
      setUserData(user);
      calculateScore(user);
    }
  }, []);

  const calculateScore = (user: UserData) => {
    let userScore = 0;

    // Check account age
    const creationDate = new Date(user.id * 1000);
    const accountAgeInYears = (Date.now() - creationDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

    if (accountAgeInYears >= 5) {
      userScore += 50;
    } else if (accountAgeInYears >= 3) {
      userScore += 30;
    } else if (accountAgeInYears >= 1) {
      userScore += 10;
    }

    // Check premium status
    if (user.is_premium) {
      userScore += 100;
    }

    setScore(userScore);
  };

  return (
    <div>
      <h2>User Score Calculator</h2>
      {userData && (
        <div>
          <p>User: {userData.first_name} {userData.last_name}</p>
          <p>Username: {userData.username || 'N/A'}</p>
          <p>Premium: {userData.is_premium ? 'Yes' : 'No'}</p>
          <p>Account Age: {((Date.now() - userData.id * 1000) / (1000 * 60 * 60 * 24 * 365)).toFixed(2)} years</p>
          {score !== null && <p>Score: {score}</p>}
        </div>
      )}
    </div>
  );
};

export default UserScoreCalculator;
