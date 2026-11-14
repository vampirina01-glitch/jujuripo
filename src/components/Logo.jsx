export default function Logo({ compact = false }) {
  return (
    <span className={`logo ${compact ? 'logo--compact' : ''}`}>
      <span className="logo__mark" aria-hidden="true">m</span>
      {!compact && <span className="logo__text">madgic<span>.</span></span>}
    </span>
  );
}
