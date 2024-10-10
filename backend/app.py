from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

import os
from dotenv import load_dotenv

load_dotenv('keys.env')
CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')

# print(f"Id: {CLIENT_ID} Secret: {CLIENT_SECRET}")

app = Flask(__name__)
CORS(app)

REDIRECT_URI = 'https://vibifyapp.netlify.app/'
# REDIRECT_URI = 'http://localhost:5173/'

# route to handle the token exchange
@app.route('/token', methods=['POST'])
def exchange_token():
    data = request.get_json()
    code = data['code']
    code_verifier = data['codeVerifier']
    
    # exchange authorization code for access token
    token_url = 'https://accounts.spotify.com/api/token'
    token_data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'code_verifier': code_verifier
    }

    # send data back to spotify
    # print('Sending to Spotify:', token_data)  
    response = requests.post(token_url, data=token_data)
    # print('Spotify response:', response.status_code, response.text)

    # check if response contains an access token
    if response.status_code == 200:
        token_json = response.json()
        if 'access_token' in token_json:
            # return access token to the frontend
            return jsonify(token_json)
        else:
            return jsonify({'error': 'Access token not found in response'}), 400
    else:
        return jsonify({'error': 'Error fetching access token from Spotify'}), response.status_code

@app.route('/ping', methods=['GET'])
def ping():
    return "pong", 200


if __name__ == '__main__':
    app.run(debug=True)
