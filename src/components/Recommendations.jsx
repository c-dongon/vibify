import React, { useState, useEffect } from 'react';

const Recommendations = () => {
  const [searchTermArtist, setSearchTermArtist] = useState('');
  const [searchTermSong, setSearchTermSong] = useState('');
  const [artistResults, setArtistResults] = useState([]);
  const [songResults, setSongResults] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [trackAttributes, setTrackAttributes] = useState({
    acousticness: 0.5,
    energy: 0.5,
    valence: 0.5,
    danceability: 0.5,
    loudness: 0.5,
    instrumentalness: 0.5,
  });
  const [generatedPlaylist, setGeneratedPlaylist] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState('');

  const fetchSpotifyResults = async (query, type) => {
    const accessToken = localStorage.getItem('spotifyAccessToken');
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=${type}&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();
    return data;
  };

  const handleArtistSearch = async (e) => {
    setSearchTermArtist(e.target.value);
    if (e.target.value) {
      const data = await fetchSpotifyResults(e.target.value, 'artist');
      setArtistResults(data.artists.items);
    }
  };

  const handleSongSearch = async (e) => {
    setSearchTermSong(e.target.value);
    if (e.target.value) {
      const data = await fetchSpotifyResults(e.target.value, 'track');
      setSongResults(data.tracks.items);
    }
  };

  const handleArtistSelection = (artist) => {
    if (selectedArtists.includes(artist)) {
      setSelectedArtists(selectedArtists.filter((a) => a.id !== artist.id));
    } else if (selectedArtists.length < 5) {
      setSelectedArtists([...selectedArtists, artist]);
    }
  };

  const handleSongSelection = (song) => {
    if (selectedSongs.includes(song)) {
      setSelectedSongs(selectedSongs.filter((s) => s.id !== song.id));
    } else if (selectedSongs.length < 5) {
      setSelectedSongs([...selectedSongs, song]);
    }
  };

  const handleTrackAttributeChange = (e) => {
    setTrackAttributes({
      ...trackAttributes,
      [e.target.name]: parseFloat(e.target.value),
    });
  };

  const handlePresetChange = (e) => {
    const preset = e.target.value;
    setSelectedPreset(preset);
    switch (preset) {
      case 'Happy':
        setTrackAttributes({
          acousticness: 0.3,
          energy: 0.8,
          valence: 1,
          danceability: 0.7,
          loudness: 0.5,
          instrumentalness: 0.1,
        });
        break;
      default:
        break;
    }
  };

  const generatePlaylist = async () => {
    const accessToken = localStorage.getItem('spotifyAccessToken');
    const artistSeeds = selectedArtists.map(artist => artist.id).join(',');
    const songSeeds = selectedSongs.map(song => song.id).join(',');

    const response = await fetch(
      `https://api.spotify.com/v1/recommendations?limit=30&seed_artists=${artistSeeds}&seed_tracks=${songSeeds}&target_acousticness=${trackAttributes.acousticness}&target_energy=${trackAttributes.energy}&target_danceability=${trackAttributes.danceability}&target_loudness=${trackAttributes.loudness}&target_instrumentalness=${trackAttributes.instrumentalness}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();
    setGeneratedPlaylist(data.tracks);
  };

  const savePlaylist = async () => {
    const accessToken = localStorage.getItem('spotifyAccessToken');
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = await userResponse.json();

    const createPlaylistResponse = await fetch(
      `https://api.spotify.com/v1/users/${userData.id}/playlists`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Vibify Playlist',
          description: 'Generated playlist based on your preferences!',
          public: true,
        }),
      }
    );

    const playlistData = await createPlaylistResponse.json();

    await fetch(
      `https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: generatedPlaylist.map(track => track.uri),
        }),
      }
    );

    window.open(playlistData.external_urls.spotify, '_blank');
  };

  return (
    <div className="recommendations-container">
      <div className="top-header">
        <h2>Pick Your Vibe</h2>
      </div>
      {/* artist/song selection */}
      <div className="listening-history-sections">  
        <div className="search-section">
          <div>
            <label>Search artists: </label>
            <input type="text" value={searchTermArtist} onChange={handleArtistSearch} />
            <ul>
              {artistResults.map(artist => (
              <li key={artist.id} className="artist-item" onClick={() => handleArtistSelection(artist)} style={{ cursor: 'pointer' }}>
              <img src={artist.images[0]?.url} alt={`${artist.name} album cover`} width="50px"/>
              <div className="artist-details">
                <div>{artist.name}</div>
                <div className="artist-genres">{artist.genres.join(", ")}</div>
              </div>
            </li>
              ))}
            </ul>
            <h4>Selected Artists:</h4>
            <ul>
              {selectedArtists.map(artist => (
              <li key={artist.id} className="artist-item" onClick={() => handleArtistSelection(artist)} style={{ cursor: 'pointer' }}>
                <img src={artist.images[0]?.url} alt={`${artist.name} album cover`} width="50px"/>
                <div className="artist-details">
                  <div>{`${artist.name} ✖`}</div>
                </div>
              </li>
            ))}
            </ul>
          </div>

          <div>
            <label>Search songs: </label>
            <input type="text" value={searchTermSong} onChange={handleSongSearch} />
            <ul>
              {songResults.map(song => (
                <li key={song.id} onClick={() => handleSongSelection(song)}>
                  {song.name} - {song.artists[0].name}
                </li>
              ))}
            </ul>
            <h4>Selected Songs:</h4>
            <ul>
              {selectedSongs.map(song => (
                <li
                key={song.id}
                onClick={() => handleSongSelection(song)}
                style={{ cursor: 'pointer' }}
                >
                {song.name} - {song.artists[0].name} 
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* track attributes */}
        <div className="attributes-section">
          <label>Pick a preset:</label>
          <select onChange={handlePresetChange} value={selectedPreset}>
            <option value="">Select a preset</option>
            <option value="Happy">Happy</option>
          </select>
          <div className="sliders">
            {['acousticness', 'energy', 'valence', 'danceability', 'loudness', 'instrumentalness'].map(attr => (
              <div key={attr}>
                <label>{attr}</label>
                <input
                  type="range"
                  name={attr}
                  min="0"
                  max="1"
                  step="0.2"
                  value={trackAttributes[attr]}
                  onChange={handleTrackAttributeChange}
                />
              </div>
            ))}
          </div>
        </div>

        {/* create playlist */}
        <div className="playlist-section">
          <button onClick={generatePlaylist}>Create Playlist</button>
          <ul className="playlist-results">
            {generatedPlaylist.map((track, index) => (
                    <li key={track.id} className="track-item">
                    <img src={track.album.images[0]?.url} alt={`${track.name} album cover`} width="50px" />
                        <div className="track-details">
                            <div className="song-title">{index + 1}. {track.name}</div>
                            <div className="artist-album">{track.artists[0].name} - {track.album.name}</div>
                        </div>
                </li>            
              ))}
          </ul>
          <button onClick={savePlaylist}>Save Playlist</button>
        </div>
      </div>
    </div>
  );
}

export default Recommendations;