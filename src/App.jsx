import React, {useState, useEffect} from 'react';

import Header from "./components/Header";
import AuthButton from "./components/AuthButton";
import LogoutButton from './components/LogoutButton';
import exchangeAuthorizationCodeForToken from './components/AuthorizeHelpers';

const code = new URLSearchParams(window.location.search).get("code")

function App() {
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
            exchangeAuthorizationCodeForToken(code)
                .then((token) => {
                    setAccessToken(token);
                    localStorage.setItem('spotifyAccessToken', token);
                    window.history.pushState({}, null, "/");
                })
                .catch((error) => {
                    console.error('Error fetching token:', error);
                });
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
                    <div className="background-gradient-top"></div>
                    <div className="background-gradient-bottom"></div>
                    <Header/>
                    <AuthButton/>
                </div>
            ) : (
                <div>
                    <h1>Welcome Back!</h1>
                    <LogoutButton/>
                </div>
            )}
        </div>
    )
}
  

export default App;
