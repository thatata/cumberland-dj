import os
import spotipy
from spotipy import oauth2
from app.model.artist import Artist
from app.model.track import Track
from app.model.album import Album
from app.model.playlist import Playlist


class SpotifyConnector:
    def __init__(self):
        self.client_id = os.environ.get('CLIENT_ID', None)
        self.client_secret = os.environ.get('CLIENT_SECRET', None)
        self.redirect_uri = os.environ.get('REDIRECT_URI', None)
        self.cache_location = os.environ.get('CACHE_LOCATION', None)
        self.supported_types = ['track', 'artist', 'album']
        self.token_info = None
        self.sp = None
        self.user_info = None
        self.sp_oauth = oauth2.SpotifyOAuth(self.client_id, self.client_secret, self.redirect_uri,
                                            scope='playlist-modify-public', cache_path=self.cache_location)
        token_info = self.sp_oauth.get_cached_token()
        if token_info:
            print('found cached access token!')
            self.process_token(token_info)

    def get_authorization_url(self):
        if not self.token_info:
            return self.sp_oauth.get_authorize_url()
        else:
            return ''

    def process_token(self, token_info):
        try:
            # refresh token if current expired
            if self.sp_oauth.is_token_expired(token_info):
                refreshed_token_info = self.sp_oauth.refresh_access_token(token_info['refresh_token'])
                if self.sp_oauth.is_token_expired(refreshed_token_info):
                    print('refresh failed!')
                    return
                self.token_info = refreshed_token_info
            else:
                self.token_info = token_info
            self.sp = spotipy.Spotify(self.token_info['access_token'])
            self.user_info = self.sp.current_user()
        except spotipy.SpotifyException as e:
            print('error processing token! ' + str(e))
            return

    def get_supported_types(self):
        return {
            'types': self.supported_types
        }

    def get_playlist(self, playlist_id):
        if not playlist_id:
            print('ERROR EMPTY PLAYLIST ID')
            return {}
        elif not self.sp:
            print('ERROR SPOTIPY NOT SET UP')
            return {}

        try:
            playlist = Playlist(self.sp.playlist(playlist_id))
            return playlist.to_json()
        except spotipy.SpotifyException as e:
            print('EXCEPTION WITH PLAYLIST CALL {}'.format(e))
            return {}

    def search(self, query_string, query_type='track'):
        if not query_string:
            print('ERROR EMPTY QUERY STRING')
            return {}
        elif query_type not in self.supported_types:
            print('ERROR UNSUPPORTED QUERY TYPE')
            return {}
        elif not self.sp:
            print('ERROR SPOTIPY NOT SET UP')
            return {}

        response = None
        result = None
        try:
            # supported types: 'artist', 'album', 'track'
            response = self.sp.search(query_string, limit=20, type=query_type)
            if query_type == 'track' and 'tracks' in response and 'items' in response['tracks']:
                result = [Track(r) for r in response['tracks']['items']]
            elif query_type == 'artist' and 'artists' in response and 'items' in response['artists']:
                result = [Artist(r) for r in response['artists']['items']]
            elif query_type == 'album' and 'albums' in response and 'items' in response['albums']:
                result = [Album(r) for r in response['albums']['items']]
            return {
                'rows': [r.to_json() for r in result]
            }
        except spotipy.SpotifyException as e:
            print('EXCEPTION WITH SPOTIPY CALL {}'.format(e))
            print('RESPONSE: {}'.format(response))
            return {}
