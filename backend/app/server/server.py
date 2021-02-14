from flask import Flask
from flask_cors import CORS
from app.util.spotify_connector import SpotifyConnector

app = Flask(__name__)
CORS(app)
sp = SpotifyConnector()


@app.route('/')
def hello_world():
    return 'Hello World'


@app.route('/search/<query_type>/<query_string>')
def search(query_type, query_string):
    return sp.search(query_string, query_type)


@app.route('/playlist/<playlist_id>')
def playlist(playlist_id):
    return sp.get_playlist(playlist_id)


@app.route('/supported-types')
def get_supported_types():
    return sp.get_supported_types()
