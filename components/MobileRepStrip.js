'use client';
import { useRef, useEffect } from 'react';
import { PhoneIcon, MailIcon } from '@/components/SidebarRepCard';

function getInitials(name) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
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
        border: '1px solid var(--hairline)',
      }}
    >
      <div className="flex items-center gap-3 px-4 pt-3 pb-2.5">
        {rep.avatar ? (
          <img
            src={rep.avatar}
            alt={rep.name}
            className="w-12 h-12 rounded-full object-cover shrink-0"
            style={{ boxShadow: '0 0 0 1px var(--hairline)' }}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-mid)', fontSize: 15, fontWeight: 650 }}
          >
            {getInitials(rep.name)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="leading-tight" style={{ color: 'var(--text-hi)', fontSize: 14.5, fontWeight: 600, letterSpacing: '-0.01em' }}>
            {rep.name}
          </p>
          <p className="mt-1 flex items-center gap-1.5 truncate" style={{ color: 'var(--text-mid)', fontSize: 11.5, fontWeight: 450 }}>
            <span className="inline-block w-2 h-2 rounded-[3px] shrink-0" style={{ background: rep.color }} />
            <span className="truncate">{rep.region}</span>
          </p>
        </div>
      </div>
      <div className="px-4 pb-3.5 pt-2.5 space-y-1.5" style={{ borderTop: '1px solid var(--hairline-soft)' }}>
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
