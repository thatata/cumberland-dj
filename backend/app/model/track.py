from app.model.spotify_object import SpotifyObject
from app.model.album import Album
from app.model.artist import Artist


class Track(SpotifyObject):
    type = 'track'
    album = dict()
    artists = []

    def __init__(self, response):
        self.parse_response(response)

    def parse_response(self, response):
        self.name = response.get('name', None)
        self.uri = response.get('uri', None)

        if 'album' in response:
            self.album = Album(response['album'])

        if 'artists' in response and len(response['artists']):
            self.artists = [Artist(r) for r in response['artists']]
