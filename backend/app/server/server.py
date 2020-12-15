from flask import Flask
from app.util.spotify_connector import SpotifyConnector
app = Flask(__name__)
sp = SpotifyConnector()


@app.route('/')
def hello_world():
    return 'Hello World'


@app.route('/search/<query_type>/<query_string>')
def search(query_type, query_string):
    return sp.search(query_string, query_type)
