
export function generateCodeVerifier(length = 128) {
    const generateRandomString = (length) => {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = crypto.getRandomValues(new Uint8Array(length));
        return values.reduce((acc, x) => acc + possible[x % possible.length], "");
    }
    
    return generateRandomString(64);
}

export async function generateCodeChallenge(codeVerifier) {
    const sha256 = async (plain) => {
        const encoder = new TextEncoder()
        const data = encoder.encode(plain)
        return window.crypto.subtle.digest('SHA-256', data)
    }
    const digest = await sha256(codeVerifier);

    // base64 url Encode the sha-256 hash
    return btoa(String.fromCharCode.apply(null, new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');  // base64 url encoding   
}

export async function exchangeAuthorizationCodeForToken(code) {
    const codeVerifier = localStorage.getItem('codeVerifier'); // Get code verifier from localStorage
    
    // console.log('Exchanging authorization code:', code);  // log code
    // console.log('Using codeVerifier:', codeVerifier);     // log code verifier

    // send code and verifier to flask
    const response = await fetch('https://vibify-ces8.onrender.com:5000/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            code: code,
            codeVerifier: codeVerifier,
        }),
    });

    // recieve access token from flask
    const data = await response.json();
    
    // store token in localStorage
    if (data.access_token) {
        localStorage.setItem('spotifyAccessToken', data.access_token);
        return data.access_token;
    } else {
        console.log('Backend response:', data); 
        throw new Error('Access token not returned by the backend');
    }

}
