import React, {useEffect, useState} from 'react';
import LogoutButton from './LogoutButton';

function DashboardHeader() {
    const [userName, setUserName] = useState("Guest");
    const [userImage, setUserImage] = useState(null);


    useEffect(() => {
        const fetchUserName = async () => {
            const accessToken = localStorage.getItem('spotifyAccessToken');

            if (accessToken) {
                try {
                    const response = await fetch('https://api.spotify.com/v1/me', {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUserName(data.display_name || 'Guest');
                        localStorage.setItem('userName', data.display_name || 'Guest');
                        
                        if (data.images && data.images.length > 0) {
                            setUserImage(data.images[0].url);
                        }
                    } else {
                        console.error('Failed to fetch user data');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUserName();
});
    return (
        <header className="dashboard-header">
            <div className="dashboard-header-left">
                <div className="header">
                    <img 
                        src="/assets/vibifyheader.png"
                        alt="Vibify header"
                    />
                </div>
                <p>Hello, {userName}!</p>
                {userImage && (
                    <img 
                        src={userImage} 
                        alt="User profile" 
                        className="user-profile-img"
                    />
                )}
            </div>
            <div className="dashboard-header-right">
            <a href="https://github.com/c-dongon/vibify" target="_blank" rel="noopener noreferrer">
                    <img
                        src="/assets/githublogo.png"
                        alt="GitHub"
                        className="github-logo"
                    />
            </a>
                <LogoutButton />
            </div>
        </header>
    );
}

export default DashboardHeader;
