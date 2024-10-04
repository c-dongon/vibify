import React, {useState, useEffect} from 'react';
import {generateCodeVerifier, generateCodeChallenge} from './AuthorizeHelpers';

const CLIENT_ID = '55d70b42b28542e38aeb268736c810b6';
const REDIRECT_URI = 'https://illustrious-dusk-9279a7.netlify.app/';
const SCOPES = 'user-read-email playlist-modify-public user-top-read';

function AuthButton() {
    const [isAuthorized, setIsAuthorized] = useState(false);
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
        

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            setIsAuthorized(true);

            if (window.opener) {
                window.opener.postMessage({
                    type: 'spotify_auth',
                    code: code,
                }, window.location.origin);
                window.close();
            }
        }
    }, []);

    return(
        <div>
            <div className="authbutton" onClick={handleLogin}>
                {isAuthorized ? 
                <span style={{color:"white", fontSize:"1.25rem"}}>Authorization successful!</span>
                : 'Login With Spotify'}
            </div>
            {isAuthorized && (<h1 className="await-server-message">Awaiting response from server...</h1>)}
        </div>
    )
}

export default AuthButton;