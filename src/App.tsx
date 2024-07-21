import React from 'react';
import {BrowserRouter as Router, Route, Routes, Link} from 'react-router-dom';
import {BottomNavigation, BottomNavigationAction} from '@mui/material';
import {Home, Leaderboard as LeaderboardIcon, People} from '@mui/icons-material';
import Tags from './components/Tags';
import Leaderboard from './components/Leaderboard';
import Friends from "./components/Friends.tsx";

const App: React.FC = () => {
    const [value, setValue] = React.useState(0);

    return (<div>
            <Router>
                <div className="app">
                    <Routes>
                        <Route path="/" element={<Tags/>}/>
                        <Route path="/leaderboard" element={<Leaderboard/>}/>
                        <Route path="/friends" element={<Friends />} />
                    </Routes>

                    <BottomNavigation
                        value={value}
                        onChange={(_, newValue) => {
                            setValue(newValue);
                        }}
                        showLabels
                        className="bottom-nav"
                    >
                        <BottomNavigationAction label="Home" icon={<Home/>} component={Link} to="/"/>
                        <BottomNavigationAction label="Leaderboard" icon={<LeaderboardIcon/>} component={Link}
                                                to="/leaderboard"/>
                        <BottomNavigationAction label="Friends" icon={<People/>} component={Link} to="/friends"/>
                    </BottomNavigation>
                </div>
            </Router>
        </div>
    );
};

export default App;