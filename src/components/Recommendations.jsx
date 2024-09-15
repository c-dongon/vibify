import React, {useState} from 'react';
import {Preview} from './Preview';

const Recommendations = () => {
  const [searchTermArtist, setSearchTermArtist] = useState('');
  const [searchTermSong, setSearchTermSong] = useState('');
  const [artistResults, setArtistResults] = useState([]);
  const [songResults, setSongResults] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const {handlePreview, playingTrackId, showNoPreviewMessage} = Preview();
  const [generatedPlaylist, setGeneratedPlaylist] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [trackAttributes, setTrackAttributes] = useState({
    Acousticness: 0.5,
    Energy: 0.5,
    Valence: 0.5,
    Danceability: 0.5,
    Tempo: 130,
    Loudness: 0.5,
    Instrumentalness: 0.5,
  });
  const attributeLabels = {
    Acousticness: {left: "Digital", right: "Acoustic"},
    Energy: {left: "Calm", right: "Energetic"},
    Valence: {left: "Sad", right: "Happy"},
    Danceability:{ left: "Stiff", right: "Groovy"},
    Tempo: {left: "Slow", right: "Fast"},
    Loudness: {left: "Quiet", right: "Loud"},
    Instrumentalness: {left: "Vocal", right: "Instrumental"}
  };


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
      case 'Cheerful':
        setTrackAttributes({Acousticness: 0.2, Energy: 0.9, Valence: 0.9, Danceability: 0.8, Tempo: 130, Loudness: 0.7, Instrumentalness: 0.4});
        break;
      case 'Gloomy':
        setTrackAttributes({Acousticness: 0.7, Energy: 0.2, Valence: 0.2, Danceability: 0.3, Tempo: 70, Loudness: 0.4, Instrumentalness: 0.4});
        break;
      case 'Energetic':
        setTrackAttributes({Acousticness: 0.1, Energy: 1, Valence: 0.7, Danceability: 0.8, Tempo: 150, Loudness: 0.9, Instrumentalness: 0.1});
        break;
      case 'Calm':
        setTrackAttributes({Acousticness: 0.8, Energy: 0.3, Valence: 0.6, Danceability: 0.3, Tempo: 70, Loudness: 0.3, Instrumentalness: 0.4});
        break;
      case 'Melancholy':
        setTrackAttributes({Acousticness: 0.6, Energy: 0.1, Valence: 0.2, Danceability: 0.4, Tempo: 60, Loudness: 0.2, Instrumentalness: 0.4});
        break;
      case 'Uplifting':
        setTrackAttributes({Acousticness: 0.3, Energy: 0.8, Valence: 0.9, Danceability: 0.7, Tempo: 130, Loudness: 0.8, Instrumentalness: 0.3});
        break;
      case 'Chill':
        setTrackAttributes({Acousticness: 0.7, Energy: 0.4, Valence: 0.5, Danceability: 0.6, Tempo: 120, Loudness: 0.4, Instrumentalness: 0.6});
        break;
    }
    
  };



  const generatePlaylist = async () => {
    if (selectedArtists.length === 0 && selectedSongs.length === 0) {
      alert('Must select at least one song or artist!');
      return;
    }
    if (selectedArtists.length + selectedSongs.length > 5) {
      alert('You can only select a total of 5 items (artists or tracks).');
    }
    const accessToken = localStorage.getItem('spotifyAccessToken');
    const artistSeeds = selectedArtists.map(artist => artist.id).join(',');
    const songSeeds = selectedSongs.map(song => song.id).join(',');

    const response = await fetch(
      `https://api.spotify.com/v1/recommendations?limit=30&seed_artists=${artistSeeds}&seed_tracks=${songSeeds}&target_acousticness=${trackAttributes.Acousticness}&target_energy=${trackAttributes.Energy}&target_danceability=${trackAttributes.Danceability}&target_loudness=${trackAttributes.Loudness}&target_instrumentalness=${trackAttributes.Instrumentalness}&target_tempo=${trackAttributes.Tempo}`,
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
    if (generatedPlaylist.length === 0) {
      alert('Must create a playlist first!');
      return;
    }

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
        <h2>Find Your Vibe</h2>
      </div>
      {/* artist/song selection */}
      <div className="listening-history-sections">  
        <div className="search-section">
          <div>
            <h3>Select artists/songs <span>(5 max)</span></h3>
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
                <img src={artist.images[0]?.url} alt={`${artist.name} album cover`}/>
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
              {songResults.map((track, index) => (
                <li key={track.id} className="track-item" onClick={() => handleSongSelection(track)}>
                    <button className="preview-button" onClick={(e) =>
                        {e.stopPropagation();
                        handlePreview(track);}}
                    >
                      {playingTrackId === track.id ? '❚❚' : '▶'}
                      {showNoPreviewMessage && (
                          <div className="no-preview-message" >
                              No preview available for this track.
                          </div>
                      )}
                    </button>
                    <img src={track.album.images[0]?.url} alt={`${track.name} album cover`} width="50px" />
                    <div className="track-details">
                      <div className="song-title"> {track.name}</div>
                      <div className="artist-album">{track.artists[0].name} - {track.album.name}</div>
                    </div>
                </li>
              ))}
            </ul>
            <h4>Selected Songs:</h4>
            <ul>
              {selectedSongs.map((track, index) => (
                <li key={track.id} className="track-item" onClick={() => handleSongSelection(track)} style={{ cursor: 'pointer' }}>
                    <img src={track.album.images[0]?.url} alt={`${track.name} album cover`} width="50px" />
                    <div className="track-details">
                      <div className="song-title"> {`${track.name} ✖`}</div>
                      <div className="artist-album">{track.artists[0].name} - {track.album.name}</div>
                    </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* track attributes */}
        <div className="attributes-section">
          <h3>Adjust Attributes</h3>
          <label>Presets:</label>
          <select onChange={handlePresetChange} value={selectedPreset}>
            <option value="">Select a preset</option>
            <option value="Cheerful">Cheerful</option>
            <option value="Gloomy">Gloomy</option>
            <option value="Melancholy">Melancholy</option>
            <option value="Energetic">Energetic</option>
            <option value="Uplifting">Uplifting</option>
            <option value="Chill">Chill</option>
          </select>
          <div className="sliders">
            {['Acousticness', 'Energy', 'Valence', 'Danceability', 'Tempo', 'Loudness', 'Instrumentalness'].map(attr => (
              <div key={attr}>
                <label>{attr}</label>
                {attr !== "Tempo" ? (
                  <input type="range" name={attr} min="0" max="1" step="0.1" value={trackAttributes[attr]} onChange={handleTrackAttributeChange}/>
                ) : (
                  <input type="range" name={attr} min="60" max="200" step="1" value={trackAttributes[attr]} onChange={handleTrackAttributeChange}/>)}
                <div className="slider-labels">
                  <span>{attributeLabels[attr].left}</span>
                  <span>{attributeLabels[attr].right}</span>
              </div>
              </div>
            ))}
          </div>
        </div>

        {/* create playlist */}
        <div className="playlist-section">
          <h3>Discover Songs</h3>
          <button className="playlist-button" onClick={generatePlaylist}>Create Playlist</button>
          <ul className="playlist-results">
            {generatedPlaylist?.length > 0 ? (
              generatedPlaylist.map((track, index) => (
                <li key={track.id} className="track-item">
                  <button className="preview-button" onClick={() => handlePreview(track)}>
                    {playingTrackId === track.id ? '❚❚' : '▶'}
                  </button>
                  <img src={track.album.images[0]?.url} alt={`${track.name} album cover`} width="50px" />
                  <div className="track-details">
                    <div className="song-title">{index + 1}. {track.name}</div>
                    <div className="artist-album">{track.artists[0].name} - {track.album.name}</div>
                  </div>
                </li>            
              ))
            ) : (
              <p>No playlist generated yet.</p>
            )}
          </ul>
          <button className="playlist-button" onClick={savePlaylist}>Save Playlist</button>
        </div>
      </div>
    </div>
  );
}

export default Recommendations;