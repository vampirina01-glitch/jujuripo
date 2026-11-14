import { Play } from 'lucide-react';

export default function VideoCard({ video, onPlay, className = '' }) {
  return (
    <button type="button" className={`video-card ${className}`} onClick={() => onPlay(video)} aria-label={`Lire la vidéo : ${video.title}`}>
      <img src={video.poster} alt="" width="1280" height="720" loading="lazy" />
      <span className="video-card__shade" aria-hidden="true" />
      <span className="video-card__play" aria-hidden="true"><Play size={22} fill="currentColor" /></span>
      <span className="video-card__meta"><strong>{video.title}</strong><small>{video.duration} · sans dévoiler l’outil</small></span>
    </button>
  );
}
