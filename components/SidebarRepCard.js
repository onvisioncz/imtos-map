'use client';

export function PhoneIcon({ color = 'currentColor', size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.18 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  );
}

export function MailIcon({ color = 'currentColor', size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

function getInitials(name) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function SidebarRepCard({ rep }) {
  function handleEnter() {
    window.dispatchEvent(new CustomEvent('imtos:highlight', { detail: { repId: rep.id } }));
  }
  function handleLeave() {
    window.dispatchEvent(new CustomEvent('imtos:reset'));
  }

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="group rounded-xl cursor-pointer px-3 py-2.5 -mx-1"
      style={{ transition: 'background 200ms var(--ease)' }}
      onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <div className="flex items-center gap-3">
        {rep.avatar ? (
          <img
            src={rep.avatar}
            alt={rep.name}
            className="w-11 h-11 rounded-full object-cover shrink-0"
            style={{ boxShadow: '0 0 0 1px var(--line-dark)' }}
          />
        ) : (
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-mid)', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600 }}
          >
            {getInitials(rep.name)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="leading-tight truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-hi)', fontSize: 14, fontWeight: 600, letterSpacing: '-0.015em' }}>
            {rep.name}
          </p>
          <p className="mt-1 flex items-center gap-1.5 truncate" style={{ color: 'var(--text-mid)', fontSize: 11, fontWeight: 400 }}>
            <span className="inline-block w-2 h-2 rounded-[3px] shrink-0" style={{ background: rep.color }} />
            <span className="truncate">{rep.region}</span>
          </p>
        </div>
      </div>

      <div className="mt-2.5 pl-14 space-y-1">
        <a
          href={`tel:${rep.phone.replace(/\s/g, '')}`}
          className="flex items-center gap-2"
          style={{ color: 'var(--text-mid)', fontSize: 12, fontVariantNumeric: 'tabular-nums', transition: 'color 200ms var(--ease)' }}
          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-hi)')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-mid)')}
        >
          <PhoneIcon color="var(--text-low)" size={12} />
          {rep.phone}
        </a>
        <a
          href={`mailto:${rep.email}`}
          className="flex items-center gap-2 truncate"
          style={{ color: 'var(--text-mid)', fontSize: 12, transition: 'color 200ms var(--ease)' }}
          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-hi)')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-mid)')}
        >
          <MailIcon color="var(--text-low)" size={12} />
          <span className="truncate">{rep.email}</span>
        </a>
      </div>
    </div>
  );
}
