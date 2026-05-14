'use client';

export default function SidebarRepCard({ rep }) {
  function handleEnter() {
    window.dispatchEvent(new CustomEvent('imtos:highlight', { detail: { repId: rep.id } }));
  }
  function handleLeave() {
    window.dispatchEvent(new CustomEvent('imtos:reset'));
  }

  function getInitials(name) {
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  }

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="rounded-lg overflow-hidden cursor-pointer"
      style={{ background: '#252220', border: '1px solid #2e2b28', transition: 'transform 0.15s, border-color 0.2s' }}
      onMouseOver={(e) => (e.currentTarget.style.borderColor = rep.color)}
      onMouseOut={(e) => (e.currentTarget.style.borderColor = '#2e2b28')}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        {rep.avatar ? (
          <img
            src={rep.avatar}
            alt={rep.name}
            className="w-14 h-14 rounded-lg object-cover shrink-0"
            style={{ border: `2px solid ${rep.color}` }}
          />
        ) : (
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: rep.color }}
          >
            {getInitials(rep.name)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold leading-tight truncate" style={{ color: '#e8e3de' }}>
            {rep.name}
          </p>
          <p className="text-[10px] mt-0.5 truncate" style={{ color: '#6b6460' }}>
            {rep.region}
          </p>
        </div>
      </div>

      <div className="px-3 pb-2.5 space-y-1" style={{ borderTop: '1px solid #2e2b28' }}>
        <a href={`tel:${rep.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 pt-2 group">
          <PhoneIcon color={rep.color} />
          <span className="text-[11px] group-hover:underline" style={{ color: '#9a948e' }}>
            {rep.phone}
          </span>
        </a>
        <a href={`mailto:${rep.email}`} className="flex items-center gap-2 group">
          <MailIcon color={rep.color} />
          <span className="text-[11px] truncate group-hover:underline" style={{ color: '#9a948e' }}>
            {rep.email}
          </span>
        </a>
      </div>
    </div>
  );
}

function PhoneIcon({ color }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.18 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  );
}

function MailIcon({ color }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}
