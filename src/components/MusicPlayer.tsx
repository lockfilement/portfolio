import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

interface Track {
  title: string;
  artist: string;
  albumArt: string;
  duration: string;
  audioSrc?: string;
}

interface MusicPlayerProps {
  tracks: Track[];
}

const MusicPlayer = ({ tracks }: MusicPlayerProps) => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef<HTMLAudioElement>(null);

  const track = tracks[currentTrack];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percent * duration;
    }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(Math.round(percent * 100));
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="mt-6">
      <p className="text-xs text-muted-foreground mb-1">
        currently in rotation — a personal collection of music i've been listening to lately
      </p>
      <div className="content-section space-y-2">
        {/* Track info */}
        <div className="flex items-center gap-2">
          <img
            src={track.albumArt}
            alt={track.title}
            className="w-7 h-7 rounded cursor-pointer"
            onClick={togglePlay}
          />
          <div className="flex-1 cursor-pointer group" onClick={togglePlay}>
            <h3 className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">
              {track.title}
            </h3>
            <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
              {track.artist}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={prevTrack}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipBack size={14} />
            </button>
            <button
              onClick={togglePlay}
              className="text-foreground hover:text-foreground/80 transition-colors"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              onClick={nextTrack}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipForward size={14} />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <Volume2 size={14} className="text-muted-foreground" />
            <div className="progress-track w-12" onClick={handleVolumeChange}>
              <div className="progress-fill" style={{ width: `${volume}%` }} />
            </div>
            <span className="text-xs text-muted-foreground w-6">{volume}%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative">
          <div className="progress-track" onClick={handleSeek}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
            <span className="text-xs text-muted-foreground">{track.duration}</span>
          </div>
        </div>

        {track.audioSrc && (
          <audio
            ref={audioRef}
            src={track.audioSrc}
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onEnded={nextTrack}
          />
        )}
      </div>
    </div>
  );
};

export default MusicPlayer;
