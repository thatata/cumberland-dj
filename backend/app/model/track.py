from app.model.spotify_object import SpotifyObject
from app.model.album import Album
from app.model.artist import Artist


class Track(SpotifyObject):
    type = 'track'
    album = dict()
    artists = []
    explicit = False

    def __init__(self, response):
        self.parse_response(response)

    def parse_response(self, response):
        self.name = response.get('name', None)
        self.uri = response.get('uri', None)
        self.explicit = response.get('explicit', False)

        if 'album' in response:
            self.album = Album(response['album'])

        if 'artists' in response and len(response['artists']):
            self.artists = [Artist(r) for r in response['artists']]

    def to_json(self):
        return {
            'title': self.name,
            'uri': self.uri,
            'album': self.album.name,
            'artist': ', '.join([a.name for a in self.artists]),
            'image_url': self.album.image_url,
            'explicit': self.explicit,
        }
