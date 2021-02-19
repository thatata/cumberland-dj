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
            self.token_info = token_info
            self.process_token()

    def get_authorization_url(self):
        if not self.token_info:
            return self.sp_oauth.get_authorize_url()
        else:
            return ''

    def is_access_token_expired(self):
        return self.sp_oauth.is_token_expired(self.token_info)

    def refresh_access_token(self):
        refreshed_token_info = self.sp_oauth.refresh_access_token(self.token_info['refresh_token'])
        self.token_info = refreshed_token_info

    def process_token(self):
        try:
            # refresh token if current expired
            if self.is_access_token_expired():
                self.refresh_access_token()
                if self.is_access_token_expired():
                    print('REFRESH FAILED! NO TOKEN UNAVAILABLE')
                    return
            self.sp = spotipy.Spotify(self.token_info['access_token'])
            self.user_info = self.sp.current_user()
        except spotipy.SpotifyException as e:
            print('EXCEPTION WITH PROCESSING ACCESS TOKEN {}'.format(e))
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
        elif self.is_access_token_expired():
            self.process_token()
            if self.is_access_token_expired():
                print('ERROR REFRESHING TOKEN!')
                return {}
        try:
            playlist = Playlist(self.sp.playlist(playlist_id))
            return playlist.to_json()
        except spotipy.SpotifyException as e:
            print('EXCEPTION WITH PLAYLIST CALL {}'.format(e))
            return {}

    def get_album(self, album_id):
        if not album_id:
            print('ERROR EMPTY ALBUM ID')
            return {}
        elif not self.sp:
            print('ERROR SPOTIPY NOT SET UP')
            return {}
        elif self.is_access_token_expired():
            self.process_token()
            if self.is_access_token_expired():
                print('ERROR REFRESHING TOKEN!')
                return {}

        try:
            response = self.sp.album_tracks(album_id)
            return {
                'rows': [Track(r).to_json() for r in response['items']]
            }
        except spotipy.SpotifyException as e:
            print('EXCEPTION WITH ALBUM CALL {}'.format(e))
            return {}

    def get_artist_tracks(self, artist_id):
        if not artist_id:
            print('ERROR EMPTY ARTIST ID')
            return {}
        elif not self.sp:
            print('ERROR SPOTIPY NOT SET UP')
            return {}
        elif self.is_access_token_expired():
            self.process_token()
            if self.is_access_token_expired():
                print('ERROR REFRESHING TOKEN!')
                return {}

        try:
            response = self.sp.artist_top_tracks(artist_id)
            return {
                'rows': [Track(r).to_json() for r in response['tracks']]
            }
        except spotipy.SpotifyException as e:
            print('EXCEPTION WITH ARTIST CALL {}'.format(e))
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
        elif self.is_access_token_expired():
            self.process_token()
            if self.is_access_token_expired():
                print('ERROR REFRESHING TOKEN!')
                return {}

        try:
            # supported types: 'artist', 'album', 'track'
            response = self.sp.search(query_string, limit=20, type=query_type)
            if query_type == 'track' and 'tracks' in response and 'items' in response['tracks']:
                result = [Track(r) for r in response['tracks']['items']]
            elif query_type == 'artist' and 'artists' in response and 'items' in response['artists']:
                result = [Artist(r) for r in response['artists']['items']]
            elif query_type == 'album' and 'albums' in response and 'items' in response['albums']:
                result = [Album(r) for r in response['albums']['items']]
            else:
                print('WARNING - SPOTIPY RESPONSE HAS CHANGED FOR QUERY TYPE {}'.format(query_type))
                result = []
            return {
                'prompt': '{} results for "{}"'.format(query_type.capitalize(), query_string),
                'rows': [r.to_json() for r in result]
            }
        except spotipy.SpotifyException as e:
            print('EXCEPTION WITH SEARCH CALL {}'.format(e))
            return {}

    def add_track(self, playlist_id, track_uri):
        if not playlist_id:
            print('ERROR EMPTY PLAYLIST ID!')
            return {}
        elif not track_uri:
            print('ERROR EMPTY TRACK URI!')
            return {}
        elif not self.sp:
            print('ERROR SPOTIPY NOT SET UP')
            return {}
        elif self.is_access_token_expired():
            self.process_token()
            if self.is_access_token_expired():
                print('ERROR REFRESHING TOKEN!')
                return {}
        response = None
        try:
            # first add track to playlist, then get updated playlist
            response = self.sp.playlist_add_items(playlist_id, [track_uri])
            return self.get_playlist(playlist_id)
        except spotipy.SpotifyException as e:
            print('EXCEPTION WITH SPOTIPY CALL {}'.format(e))
            print('RESPONSE: {}'.format(response))
            return {}
