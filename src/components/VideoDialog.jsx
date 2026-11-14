import { X } from 'lucide-react';
import Dialog from './Dialog.jsx';

export default function VideoDialog({ video, onClose }) {
  return (
    <Dialog titleId="video-title" className="video-modal" onClose={onClose}>
      <header className="modal__header">
        <div>
          <p className="eyebrow">Madgic · vidéo</p>
          <h2 id="video-title">{video.title}</h2>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer" data-autofocus><X size={20} /></button>
      </header>
      <video className="video-modal__player" controls autoPlay muted playsInline preload="metadata" poster={video.poster} aria-label={video.title}>
        <source src={video.src} type="video/mp4" />
        Votre navigateur ne peut pas lire cette vidéo.
      </video>
      <p className="video-modal__note">{video.note}</p>
      <details className="video-transcript">
        <summary>Lire la transcription</summary>
        <ol>{video.transcript.map((line) => <li key={line}>{line}</li>)}</ol>
      </details>
    </Dialog>
  );
}
