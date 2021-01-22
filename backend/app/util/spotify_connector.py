import os
import json
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from app.model.artist import Artist
from app.model.track import Track
from app.model.album import Album


class SpotifyConnector:
    def __init__(self):
        self.client_id = os.environ.get('CLIENT_ID', None)
        self.client_secret = os.environ.get('CLIENT_SECRET', None)
        client_credentials_manager = SpotifyClientCredentials(client_id=self.client_id, client_secret=self.client_secret)
        self.sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)
        self.supported_types = ['track', 'artist', 'album']

    def get_supported_types(self):
        return {
            'types': self.supported_types
        }

    def search(self, query_string, query_type='track'):
        if not query_string:
            print('ERROR EMPTY QUERY STRING')
            return {}

        response = None
        result = None
        try:
            # supported types: 'artist', 'album', 'track'
            # other types (maybe future enhancement): 'playlist', 'show', or 'episode'
            response = self.sp.search(query_string, limit=20, type=query_type)
            if query_type == 'track' and 'tracks' in response and 'items' in response['tracks']:
                result = [Track(r) for r in response['tracks']['items']]
            elif query_type == 'artist' and 'artists' in response and 'items' in response['artists']:
                result = [Artist(r) for r in response['artists']['items']]
            elif query_type == 'album' and 'albums' in response and 'items' in response['albums']:
                result = [Album(r) for r in response['albums']['items']]
            return json.dumps(result, default=lambda o: o.__dict__)
        except spotipy.SpotifyException as e:
        # except (spotipy.SpotifyException, AttributeError) as e:
            print('EXCEPTION WITH SPOTIPY CALL {}'.format(e))
            print('RESPONSE: {}'.format(response))
            return {}
