import React, {useEffect} from 'react';
import {generateCodeVerifier, generateCodeChallenge} from './AuthorizeHelpers';

const CLIENT_ID = '55d70b42b28542e38aeb268736c810b6';
const REDIRECT_URI = 'http://localhost:5173';
const SCOPES = 'user-read-private user-read-email playlist-modify-public user-top-read user-read-recently-played';

function AuthButton() {
    const handleLogin = async () => {
        // PKCE code verifier and challenge
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        // store codeVerifier in localStorage
        localStorage.setItem('codeVerifier', codeVerifier);

        // redirect to authorization
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code_challenge_method=S256&code_challenge=${codeChallenge}&scope=${encodeURIComponent(SCOPES)}`;
        window.location.href = authUrl;
    };
        

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

        if (window.opener) {
            window.opener.postMessage({
                type: 'spotify_auth',
                code: code,
            }, window.location.origin);

            window.close();

    }

    return(
        <div className = "authbutton" onClick={handleLogin}>
            Login With Spotify
        </div>

    )
}

export default AuthButton;