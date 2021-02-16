import os
from flask import Flask, request
from flask_cors import CORS
from app.util.spotify_connector import SpotifyConnector

app = Flask(__name__)
CORS(app)
sp = SpotifyConnector()


@app.route('/')
def empty_route():
    if not sp.token_info:
        url = request.url
        code = sp.sp_oauth.parse_response_code(url)
        if code != url:
            print("Found Spotify auth code in Request URL! Trying to get valid access token...")
            token_info = sp.sp_oauth.get_access_token(code)
            sp.process_token(token_info)
            return '<div style="font-size: 3rem;">Authorized!<script>window.close();</script></div>'
    return 'Hello World'


@app.route('/search/<query_type>/<query_string>')
def search(query_type, query_string):
    return sp.search(query_string, query_type)


@app.route('/playlist/<playlist_id>')
def playlist(playlist_id):
    return sp.get_playlist(playlist_id)


@app.route('/get-authorization-url')
def get_authorization_url():
    return sp.get_authorization_url()


@app.route('/supported-types')
def get_supported_types():
    return sp.get_supported_types()


@app.route('/clear-access-token')
def clear_access_token():
    global sp
    if os.path.exists(sp.cache_location):
        os.remove(sp.cache_location)
    sp = SpotifyConnector()
    return 'Cleared'

