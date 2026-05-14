'use client';
import { useRef, useEffect } from 'react';

function getInitials(name) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function PhoneIcon({ color }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.18 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  );
}

function MailIcon({ color }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

function MobileRepCard({ rep }) {
  return (
    <div
      data-rep={rep.id}
      className="shrink-0 rounded-xl overflow-hidden flex flex-col"
      style={{
        scrollSnapAlign: 'center',
        width: 'calc(100vw - 56px)',
        background: '#252220',
        border: `1.5px solid ${rep.color}`,
      }}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        {rep.avatar ? (
          <img
            src={rep.avatar}
            alt={rep.name}
            className="w-12 h-12 rounded-lg object-cover shrink-0"
            style={{ border: `2px solid ${rep.color}` }}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
            style={{ background: rep.color, fontSize: 16 }}
          >
            {getInitials(rep.name)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold leading-tight" style={{ color: '#e8e3de', fontSize: 14 }}>
            {rep.name}
          </p>
          <p className="mt-0.5 truncate" style={{ color: '#6b6460', fontSize: 11 }}>
            {rep.region}
          </p>
        </div>
      </div>
      <div className="px-3 pb-3 space-y-1.5" style={{ borderTop: '1px solid #2e2b28' }}>
        <a href={`tel:${rep.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 pt-2">
          <PhoneIcon color={rep.color} />
          <span style={{ color: '#9a948e', fontSize: 13 }}>{rep.phone}</span>
        </a>
        <a href={`mailto:${rep.email}`} className="flex items-center gap-2">
          <MailIcon color={rep.color} />
          <span className="truncate" style={{ color: '#9a948e', fontSize: 13 }}>{rep.email}</span>
        </a>
      </div>
    </div>
  );
}

export default function MobileRepStrip({ reps }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Highlight first rep on load
    if (reps.length > 0) {
      window.dispatchEvent(new CustomEvent('imtos:highlight', { detail: { repId: reps[0].id } }));
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            window.dispatchEvent(
              new CustomEvent('imtos:highlight', { detail: { repId: entry.target.dataset.rep } })
            );
          }
        });
      },
      { root: container, threshold: 0.5 }
    );

    const cards = container.querySelectorAll('[data-rep]');
    cards.forEach((card) => obs.observe(card));

    return () => obs.disconnect();
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
