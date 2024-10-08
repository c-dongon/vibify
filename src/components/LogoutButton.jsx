import React, {useState} from 'react';

function LogoutButton() {
    const handleLogout = () => {
        localStorage.removeItem('spotifyAccessToken');
        window.location.href = '/';
        
    };

    return (
        <div className="logout-button">
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default LogoutButton;