from app.model.spotify_object import SpotifyObject
from app.model.track import Track


class Playlist(SpotifyObject):
    type = 'playlist'
    tracks = []

    def __init__(self, response):
        self.parse_response(response)

    def parse_response(self, response):
        self.name = response.get('name', None)
        self.uri = response.get('uri', None)

        if 'images' in response and len(response['images']) and 'url' in response['images'][0]:
            self.image_url = response['images'][0]['url']

        if 'tracks' in response and 'items' in response['tracks'] and len(response['tracks']['items']):
            self.tracks = [Track(r['track']) for r in response['tracks']['items']]

    def to_json(self):
        return {
            'name': self.name,
            'uri': self.uri,
            'image_url': self.image_url,
            'rows': [t.to_json() for t in self.tracks]
        }
