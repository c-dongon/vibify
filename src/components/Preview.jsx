import {useState} from 'react';

export function Preview() {
    const [playingTrackId, setPlayingTrackId] = useState(null);
    const [audio, setAudio] = useState(null);
    const [showNoPreviewMessage, setShowNoPreviewMessage] = useState(false);
    const volume = 0.03;

    const handlePreview = (track) => {
        if (!track.preview_url) {
            setShowNoPreviewMessage(true);
            setTimeout(() => {
                setShowNoPreviewMessage(false);
            }, 1000); 
            return;
        }
        if (playingTrackId === track.id) {
            audio.pause();
            setPlayingTrackId(null);
        } else {
            if (audio) audio.pause();
            const newAudio = new Audio(track.preview_url);
            newAudio.play();
            newAudio.volume = volume;
            setAudio(newAudio);
            setPlayingTrackId(track.id);
        }
    };


    return {handlePreview, playingTrackId, showNoPreviewMessage};
}
