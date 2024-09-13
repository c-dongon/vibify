import React, {useState, useEffect, useRef} from 'react';

import Header from "./components/Header";
import AuthButton from "./components/AuthButton";
import TopListeningHistory from './components/TopListeningHistory';
import DashboardHeader from './components/DashboardHeader';
import {exchangeAuthorizationCodeForToken} from './components/AuthorizeHelpers';
import Recommendations from './components/Recommendations';

function App() {
    const [accessToken, setAccessToken] = useState(null);
    const [authSuccess, setAuthSuccess] = useState(false); 

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!localStorage.getItem('spotifyAccessToken') && code) {
            exchangeAuthorizationCodeForToken(code)
                .then((token) => {
                    setAuthSuccess(true);  
                    localStorage.setItem('spotifyAccessToken', token);
                    setTimeout(() => {
                        setAccessToken(token); 
                    }, 2000);
                    window.history.replaceState({}, null, "/");
                })
                .catch((error) => {
                    console.error('Error fetching token:', error);
                })

        } else {
            const savedToken = localStorage.getItem('spotifyAccessToken');
            if (savedToken) {
                setAccessToken(savedToken);
            }
        }

    }, []);

    return(
        <div>
            {!accessToken ? (
                <div>
                    <div className="background"></div>
                    <div className="background-gradient"></div>
                    <div className="login-container">
                        <Header/>
                        <AuthButton/>   
                    </div>
                    {authSuccess && (
                        <div>
                            <div className="gradient-transition"></div>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <DashboardHeader/>
                    <div className="dashboard-container">
                        <Recommendations/>
                        <TopListeningHistory/>
                    </div>
                </div>    
            )}
        </div>
    )
}

export default App;