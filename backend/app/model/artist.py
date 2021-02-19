from app.model.spotify_object import SpotifyObject


class Artist(SpotifyObject):
    type = 'artist'

    def __init__(self, response):
        self.parse_response(response)

    def parse_response(self, response):
        self.name = response.get('name', None)
        self.uri = response.get('uri', None)

        if 'images' in response and len(response['images']) and 'url' in response['images'][0]:
            self.image_url = response['images'][0]['url']

    def to_json(self):
        return {
            'name': self.name,
            'uri': self.uri,
            'image_url': self.image_url,
            'type': self.type
        }
