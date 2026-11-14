import { useRef } from 'react';
import { BookOpen } from 'lucide-react';

export default function BookShowcase({ cover }) {
  const ref = useRef(null);
  const onMove = (event) => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    node.style.setProperty('--ry', `${(x * 7).toFixed(2)}deg`);
    node.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`);
  };
  const reset = () => {
    ref.current?.style.setProperty('--ry', '0deg');
    ref.current?.style.setProperty('--rx', '0deg');
  };
  return (
    <div className="hero__product" data-reveal onPointerMove={onMove} onPointerLeave={reset}>
      <div className="book-display" ref={ref}>
        <div className="book-shadow" aria-hidden="true" />
        <img className="book-cover" src={cover} alt="Couverture du Guide de l’IA gratuite : plusieurs intelligences artificielles, un agent, un accès officiel" width="900" height="1200" fetchPriority="high" />
      </div>
      <p className="product-caption"><BookOpen size={15} aria-hidden="true" /> Un guide à lire. Des étapes à appliquer.</p>
    </div>
  );
}
