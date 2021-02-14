from app.model.spotify_object import SpotifyObject
from app.model.artist import Artist


class Album(SpotifyObject):
    type = 'album'
    artists = []

    def __init__(self, response):
        self.parse_response(response)

    def parse_response(self, response):
        self.name = response.get('name', None)
        self.uri = response.get('uri', None)

        if 'images' in response and len(response['images']) and 'url' in response['images'][0]:
            self.image_url = response['images'][0]['url']

        if 'artists' in response and len(response['artists']):
            self.artists = [Artist(r) for r in response['artists']]

    def to_json(self):
        return {
            'title': self.name,
            'uri': self.uri,
            'image_url': self.image_url,
            'artist': ', '.join([a.name for a in self.artists])
        }
