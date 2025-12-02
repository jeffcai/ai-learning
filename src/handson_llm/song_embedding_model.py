import pandas as pd
from urllib import request

# Get the playlist dataset file
data = request.urlopen('https://storage.googleapis.com/maps-premium/dataset/yes_complete/train.txt')

# Parse the playlist dataset file. Skip the first two lines as they only contain metadata
lines = data.read().decode("utf-8").split('\n')[2:]

# Remove playlists with only one song
playlists = [s.rstrip().split() for s in lines if len(s.split()) > 1]

# Load song metadata
songs_file = request.urlopen('https://storage.googleapis.com/maps-premium/dataset/yes_complete/song_hash.txt')
songs_file = songs_file.read().decode("utf-8").split('\n')
songs = [s.rstrip().split('\t') for s in songs_file]
# Filter out rows that don't have exactly 3 columns (id, title, artist)
songs = [s for s in songs if len(s) == 3]
# Strip whitespace from all fields
songs = [[field.strip() for field in row] for row in songs]
songs_df = pd.DataFrame(data=songs, columns = ['id', 'title', 'artist'])
songs_df = songs_df.set_index('id')

from gensim.models import Word2Vec

# Train our Word2Vec model
model = Word2Vec(playlists, vector_size=32, window=20, negative=50, min_count=1, workers=4)

song_id = 2172
# Ask the model for songs similar to song #2172
similar_songs = model.wv.most_similar(positive=str(song_id))

print(f"Target song: {songs_df.loc[str(song_id)]['title']} by {songs_df.loc[str(song_id)]['artist']}")
print(f"\nSongs similar to song #{song_id}:")
for similar_song_id, similarity in similar_songs:
    try:
        song_info = songs_df.loc[similar_song_id]
        print(f"- {song_info['title']} by {song_info['artist']} (Similarity: {similarity:.2f})")
    except KeyError:
        print(f"- ID {similar_song_id} (Metadata not found) (Similarity: {similarity:.2f})")

