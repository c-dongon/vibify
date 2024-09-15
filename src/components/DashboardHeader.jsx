import React, {useEffect, useState} from 'react';
import LogoutButton from './LogoutButton';

function DashboardHeader() {
    const [userName, setUserName] = useState("Guest");

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
                <h1>Vibify</h1>
                <p>Hello, {userName}!</p>
            </div>
            <div className="dashboard-header-right">
                <LogoutButton />
            </div>
        </header>
    );
}

export default DashboardHeader;
