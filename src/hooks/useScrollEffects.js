import { useEffect } from 'react';

export default function useScrollEffects() {
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer = null;
    let frame = 0;

    const reveal = () => {
      observer?.disconnect();
      const nodes = [...document.querySelectorAll('[data-reveal]')];
      if (motionQuery.matches || !('IntersectionObserver' in window)) {
        document.documentElement.classList.remove('reveal-ready');
        nodes.forEach((node) => node.classList.add('is-visible'));
        return;
      }
      document.documentElement.classList.add('reveal-ready');
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      nodes.forEach((node) => observer.observe(node));
    };

    const progress = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      document.documentElement.style.setProperty('--scroll-progress', value.toFixed(4));
      document.querySelector('.site-header')?.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(progress);
    };

    reveal();
    progress();
    motionQuery.addEventListener('change', reveal);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      observer?.disconnect();
      motionQuery.removeEventListener('change', reveal);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      document.documentElement.classList.remove('reveal-ready');
    };
  }, []);
}
