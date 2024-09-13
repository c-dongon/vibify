import React, { useState, useEffect } from 'react';

const handleTokenExpiry = () => {
    localStorage.removeItem('spotifyAccessToken');
    window.location.href = '/';  

};

function TopListeningHistory() {
    const [timeRange, setTimeRange] = useState('short_term');
    const [topTracks, setTopTracks] = useState([]);
    const [topAlbums, setTopAlbums] = useState([]);
    const [topArtists, setTopArtists] = useState([]);
    const [playingTrackId, setPlayingTrackId] = useState(null);
    const [audio, setAudio] = useState(null);
    const [volume, setVolume] = useState(0.05);

    const handleTimeRangeChange = (e) => {
         setTimeRange(e.target.value);
    };

    useEffect(() => {
        fetchTopData();
    }, [timeRange]);

    const fetchTopData = async () => {
        const accessToken = localStorage.getItem('spotifyAccessToken');

    if (accessToken) {
        // get top tracks
        const tracksResponse = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=10`, {
            headers: {
            Authorization: `Bearer ${accessToken}`,
            },
        });
        
        if (tracksResponse.status === 401) {
            handleTokenExpiry();
            return;
        }

        const tracksData = await tracksResponse.json();
        setTopTracks(tracksData.items);

        // get top albums (from top tracks)
        const albums = tracksData.items.map(track => track.album);
        const uniqueAlbums = Array.from(new Set(albums.map(album => album.id)))
            .map(id => albums.find(album => album.id === id));
        setTopAlbums(uniqueAlbums);

        // get top artists
        const artistsResponse = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=10`, {
            headers: {
            Authorization: `Bearer ${accessToken}`,
            },
        });

        if (tracksResponse.status === 401) {
            handleTokenExpiry();
            return;
        }

      const artistsData = await artistsResponse.json();
      setTopArtists(artistsData.items);
    }
  };

    const handlePreview = (track) => {
        if (playingTrackId === track.id) {
        audio.pause();
        setPlayingTrackId(null);
        } else {
        if (audio) audio.pause();
        const newAudio = new Audio(track.preview_url);
        newAudio.volume = volume;
        newAudio.play();
        setAudio(newAudio);
        setPlayingTrackId(track.id);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = e.target.value;
        setVolume(newVolume);
        if (audio) audio.volume = newVolume;
    };

    return (
        <div className="listening-history-container">
            {/* header, time range, volume bar */}
            <div className="top-header">
                <h2>Top Listening History</h2>
                <select className="timeRange" value={timeRange} onChange={handleTimeRangeChange}>
                    <option value="short_term">Past 4 weeks</option>
                    <option value="medium_term">Past 6 months</option>
                    <option value="long_term">Past year</option>
                </select>
                <div className="volume-control">
                    <label>Volume:</label>
                    <input className="volume-bar" type="range" min="0" max="0.1" step="0.01" value={volume} onChange={handleVolumeChange} />
                </div>
            </div>

            {/* top: songs, albums, and artists sections */}
            <div className="listening-history-sections">
                {/* top songs */}
                <div className="section songs-section">
                    <h3>Top Songs</h3>
                <ul>
                    {topTracks.map((track, index) => (
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
                    ))}
                </ul>
                </div>

                {/* top albums */}
                <div className="section albums-section">
                    <h3>Top Albums</h3>
                <ul>
                    {topAlbums.map((album, index) => (
                    <li key={album.id} className="album-item">
                        <img src={album.images[0]?.url} alt={`${album.name} album cover`} width="50px"/>
                        <div className="album-details">
                            <div className="album-title">{index + 1}. {album.name}</div>
                            <div className="album-artist">{album.artists[0].name}</div>
                        </div>                
                    </li>
                    ))}
                </ul>
                </div>

                {/* top artists */}
                <div className="section artists-section">
                    <h3>Top Artists</h3>
                <ul>
                    {topArtists.map((artist, index) => (
                    <li key={artist.id} className="artist-item">
                        <img src={artist.images[0]?.url} alt={`${artist.name} album cover`} width="50px"/>
                        <div className="artist-details">
                            <div>{index + 1}. {artist.name}</div>
                            <div className="artist-genres">{artist.genres.join(", ")}</div>
                        </div>
                    </li>
                    ))}
                </ul>
                </div>
            </div>
        </div>
    );
}

export default TopListeningHistory;
