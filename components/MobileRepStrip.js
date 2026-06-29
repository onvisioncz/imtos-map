'use client';
import { useRef, useEffect } from 'react';
import { PhoneIcon, MailIcon } from '@/components/SidebarRepCard';

function getInitials(name) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

// Plynulé scrollování pruhu — scroll-snap blokuje scrollTo({behavior:smooth}),
// proto animujeme ručně přes requestAnimationFrame s instantním fallbackem.
function smoothScrollTo(el, targetLeft, duration = 440) {
  const start = el.scrollLeft;
  const dist = targetLeft - start;
  if (Math.abs(dist) < 2) return;
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
  let t0 = null;
  let raf = 0;
  let done = false;
  // Instantní fallback, pokud rAF neběží (např. tab na pozadí)
  const fallback = setTimeout(() => {
    if (!done) {
      cancelAnimationFrame(raf);
      el.scrollLeft = targetLeft;
    }
  }, duration + 120);
  function step(now) {
    if (t0 === null) t0 = now;
    const p = Math.min(1, (now - t0) / duration);
    el.scrollLeft = start + dist * easeOutQuart(p);
    if (p < 1) {
      raf = requestAnimationFrame(step);
    } else {
      done = true;
      clearTimeout(fallback);
    }
  }
  raf = requestAnimationFrame(step);
}

function MobileRepCard({ rep }) {
  return (
    <div
      data-rep={rep.id}
      className="shrink-0 rounded-2xl overflow-hidden flex flex-col"
      style={{
        scrollSnapAlign: 'center',
        width: 'calc(100vw - 56px)',
        background: 'var(--bg-header)',
        border: '1px solid var(--line-dark)',
      }}
    >
      <div className="flex items-center gap-3 px-4 pt-3 pb-2.5">
        {rep.avatar ? (
          <img
            src={rep.avatar}
            alt={rep.name}
            className="w-12 h-12 rounded-full object-cover shrink-0"
            style={{ boxShadow: '0 0 0 1px var(--line-dark)' }}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-mid)', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600 }}
          >
            {getInitials(rep.name)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-hi)', fontSize: 15, fontWeight: 600, letterSpacing: '-0.015em' }}>
            {rep.name}
          </p>
          <p className="mt-1 flex items-center gap-1.5 truncate" style={{ color: 'var(--text-mid)', fontSize: 11.5, fontWeight: 400 }}>
            <span className="inline-block w-2 h-2 rounded-[3px] shrink-0" style={{ background: rep.color }} />
            <span className="truncate">{rep.region}</span>
          </p>
        </div>
      </div>
      <div className="px-4 pb-3.5 pt-2.5 space-y-1.5" style={{ borderTop: '1px solid var(--line-dark-soft)' }}>
        <a href={`tel:${rep.phone.replace(/\s/g, '')}`} className="flex items-center gap-2.5" style={{ color: 'var(--text-mid)', fontSize: 13.5, fontVariantNumeric: 'tabular-nums' }}>
          <PhoneIcon color="var(--text-low)" size={13} />
          {rep.phone}
        </a>
        <a href={`mailto:${rep.email}`} className="flex items-center gap-2.5" style={{ color: 'var(--text-mid)', fontSize: 13.5 }}>
          <MailIcon color="var(--text-low)" size={13} />
          <span className="truncate">{rep.email}</span>
        </a>
      </div>
    </div>
  );
}

export default function MobileRepStrip({ reps }) {
  const containerRef = useRef(null);
  const interacted = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Úvodní obrazovka zůstává v plné barvě — highlight až po interakci uživatele
    const markInteract = () => {
      interacted.current = true;
    };
    container.addEventListener('scroll', markInteract, { passive: true });
    container.addEventListener('touchstart', markInteract, { passive: true });

    const obs = new IntersectionObserver(
      (entries) => {
        if (!interacted.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            window.dispatchEvent(
              new CustomEvent('imtos:highlight', {
                detail: { repId: entry.target.dataset.rep, zoom: true },
              })
            );
          }
        });
      },
      { root: container, threshold: 0.5 }
    );

    const cards = container.querySelectorAll('[data-rep]');
    cards.forEach((card) => obs.observe(card));

    // Klik na oblast v mapě → posuň pruh na daného obchodníka a zvýrazni
    const onSelect = (e) => {
      const id = e.detail.repId;
      const card = container.querySelector(`[data-rep="${id}"]`);
      if (!card) return;
      interacted.current = true;
      const left = card.offsetLeft - (container.clientWidth - card.offsetWidth) / 2;
      // scroll-snap blocks smooth programmatic scroll → animate manually
      smoothScrollTo(container, Math.max(0, left));
      window.dispatchEvent(
        new CustomEvent('imtos:highlight', { detail: { repId: id, zoom: true } })
      );
    };
    window.addEventListener('imtos:selectRep', onSelect);

    return () => {
      obs.disconnect();
      window.removeEventListener('imtos:selectRep', onSelect);
      container.removeEventListener('scroll', markInteract);
      container.removeEventListener('touchstart', markInteract);
    };
  }, [reps]);

  return (
    <div
      ref={containerRef}
      className="flex flex-1 overflow-x-auto gap-3 px-7 py-3 items-center"
      style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
    >
      {reps.map((rep) => (
        <MobileRepCard key={rep.id} rep={rep} />
      ))}
      <div className="shrink-0 w-4" aria-hidden />
    </div>
  );
}
