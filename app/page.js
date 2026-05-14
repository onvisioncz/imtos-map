import dynamic from 'next/dynamic';
import { salesReps } from '@/lib/data';
import SidebarRepCard from '@/components/SidebarRepCard';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D41029] mx-auto mb-3" />
        <p className="text-gray-400 text-sm tracking-wide">Načítám mapu…</p>
      </div>
    </div>
  ),
});

const ImtosLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 184.389 72.924" style={{ width: 160, height: 'auto' }} aria-label="IMTOS">
    <path fill="#FFFFFF" d="M108.798,21.355c-4.515,0-8.05,1.429-10.505,4.249c-2.31,2.651-3.53,6.501-3.53,11.13v4.636c0,4.629,1.22,8.478,3.53,11.13c2.455,2.82,5.99,4.25,10.505,4.25c4.456,0,8.1-1.469,10.538-4.249c2.33-2.657,3.562-6.507,3.562-11.132v-4.636c0-4.625-1.232-8.474-3.562-11.131C116.899,22.824,113.255,21.355,108.798,21.355z M101.12,36.733c0-6.43,2.582-9.689,7.677-9.689c2.606,0,4.582,0.862,5.872,2.563c1.239,1.632,1.866,4.03,1.866,7.126v4.636c0,3.108-0.635,5.513-1.887,7.147c-1.293,1.688-3.262,2.543-5.851,2.543c-5.094,0-7.677-3.261-7.677-9.691L101.12,36.733L101.12,36.733z"/>
    <path fill="#FFFFFF" d="M143.047,37.772l-6.043-3.601c-2.629-1.543-3.964-2.618-3.964-4.208c0-2.586,1.669-3.041,5.177-3.041c3.674,0,7.994,0.366,9.413,0.486l0.224,0.002c0.946,0,1.533-0.586,1.533-1.533v-2.01c0-0.935-0.576-1.559-1.571-1.71c-3.124-0.531-6.353-0.8-9.599-0.8c-7.763,0-11.536,2.816-11.536,8.608c0,3.616,1.991,6.438,6.463,9.148l6.16,3.66c3.361,2.006,4.332,3.046,4.332,4.637c0,2.759-1.554,3.835-5.542,3.835c-2.22,0-6.666-0.311-9.514-0.667l-0.306-0.004c-0.907,0-1.592,0.606-1.592,1.41v2.136c0,0.602,0.289,1.385,1.659,1.7c2.803,0.687,7.007,0.931,9.754,0.931c3.659,0,6.538-0.734,8.556-2.182c2.222-1.594,3.348-4.003,3.348-7.159C149.998,43.427,148.048,40.724,143.047,37.772z"/>
    <path fill="#FFFFFF" d="M59.709,21.294c-3.786,0-7.232,0.712-10.24,2.115c-1.646-1.459-3.911-2.115-7.266-2.115c-4.306,0-8.747,1.068-13.202,3.175l-0.285,0.135v30.003c0,0.978,0.659,1.716,1.533,1.716h3.233c0.784,0,1.595-0.642,1.595-1.716V28.098c2.064-0.721,4.214-1.117,6.091-1.117c2.353,0,5.054,0.686,5.054,6.032v21.592c0,0.978,0.659,1.716,1.534,1.716h3.233c0.985,0,1.594-0.891,1.594-1.716V32.89c0-0.513-0.016-1.032-0.052-1.59l-0.003-0.041c-0.013-0.199-0.028-0.394-0.047-0.58c-0.011-0.13-0.024-0.257-0.038-0.382c-0.001-0.009-0.002-0.02-0.003-0.029l-0.001-0.005c-0.071-0.647-0.169-1.259-0.294-1.828c2.6-0.963,4.794-1.452,6.525-1.452c2.354,0,5.056,0.686,5.056,6.032v21.592c0,0.947,0.77,1.716,1.716,1.716h2.928c0.947,0,1.717-0.769,1.717-1.716V33.014C70.088,27.668,68.288,21.294,59.709,21.294z"/>
    <path fill="#FFFFFF" d="M89.727,51.426h-3.415c-2.079,0-2.798-0.162-2.798-3.346V27.288h5.951c0.945,0,1.714-0.769,1.714-1.715v-2.075c0-0.947-0.768-1.716-1.714-1.716h-5.951v-6.151c0-0.859-0.62-1.533-1.411-1.533h-3.54c-0.791,0-1.41,0.674-1.41,1.533v32.45c0,7.252,3.223,8.671,8.79,8.671c1.175,0,2.798-0.125,4.042-0.31c1.256-0.195,1.519-0.939,1.519-1.529v-2.134C91.505,52.16,91.197,51.426,89.727,51.426z"/>
    <path fill="#D41029" d="M14.015,32.881c-0.877,1.596-0.877,3.412-0.877,6.159l0.009,7.686l0.011,7.879c0,0.946,0.769,1.715,1.716,1.715h4.055c0.947,0,1.716-0.769,1.716-1.715l0.008-4.495h0.003V27.668l-0.741,0.42C16.456,30.051,14.857,31.35,14.015,32.881z"/>
    <path fill="#D41029" d="M20.911,17.691c0.06-1.62-0.643-3.089-1.98-4.136c-1.525-1.195-3.708-1.665-5.431-1.17l-0.359,0.103v14.297l0.741-0.421C19.496,23.179,20.744,21.639,20.911,17.691z"/>
  </svg>
);

export default function HomePage() {
  const allReps = Object.values(salesReps);
  const czReps = allReps.filter((r) => !r.region.includes('Slovensko'));
  const skReps = allReps.filter((r) => r.region.includes('Slovensko'));

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-full md:w-80 lg:w-96 shrink-0 flex flex-col z-10 overflow-hidden order-2 md:order-1 h-[44vh] md:h-full" style={{ background: '#1a1917' }}>

        {/* Logo block */}
        <div className="px-6 pt-7 pb-5" style={{ background: '#3D3935' }}>
          <div className="logo-pulse" style={{ display: 'inline-block' }}>
            <ImtosLogo />
          </div>
          <div className="mt-3 border-t border-white/10 pt-3">
            <p className="text-[11px] uppercase tracking-[0.18em] font-medium" style={{ color: '#9a948e' }}>
              CNC Stroje a Technologie
            </p>
            <p className="text-[10px] tracking-wider mt-0.5" style={{ color: '#6b6460' }}>
              Mapa obchodního zastoupení
            </p>
          </div>
        </div>

        {/* Red accent line */}
        <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #D41029 0%, #ff4d5e 60%, transparent 100%)' }} />

        {/* Rep list */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base leading-none">🇨🇿</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: '#6b6460' }}>
                Česká republika
              </span>
              <div className="flex-1 h-px" style={{ background: '#2e2b28' }} />
            </div>
            <div className="space-y-2">
              {czReps.map((rep) => <SidebarRepCard key={rep.id} rep={rep} />)}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base leading-none">🇸🇰</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: '#6b6460' }}>
                Slovensko
              </span>
              <div className="flex-1 h-px" style={{ background: '#2e2b28' }} />
            </div>
            <div className="space-y-2">
              {skReps.map((rep) => <SidebarRepCard key={rep.id} rep={rep} />)}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderTop: '1px solid #2e2b28' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 184.389 72.924" style={{ width: 18, height: 'auto', opacity: 0.4 }}>
            <path fill="#D41029" d="M14.015,32.881c-0.877,1.596-0.877,3.412-0.877,6.159l0.009,7.686l0.011,7.879c0,0.946,0.769,1.715,1.716,1.715h4.055c0.947,0,1.716-0.769,1.716-1.715l0.008-4.495h0.003V27.668l-0.741,0.42C16.456,30.051,14.857,31.35,14.015,32.881z"/>
            <path fill="#D41029" d="M20.911,17.691c0.06-1.62-0.643-3.089-1.98-4.136c-1.525-1.195-3.708-1.665-5.431-1.17l-0.359,0.103v14.297l0.741-0.421C19.496,23.179,20.744,21.639,20.911,17.691z"/>
          </svg>
          <p className="text-[10px] tracking-wide" style={{ color: '#4a4744' }}>
            Klikněte na kraj pro kontakt
          </p>
        </div>
      </aside>

      {/* ── Map ── */}
      <main className="flex-1 relative order-1 md:order-2 min-h-0">
        <Map />
      </main>
    </div>
  );
}

function getInitials(name) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function RepCard({ rep }) {
  return (
    <div
      className="rounded-lg overflow-hidden transition-all duration-150 hover:translate-x-0.5"
      style={{ background: '#252220', border: '1px solid #2e2b28' }}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Avatar */}
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

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold leading-tight truncate" style={{ color: '#e8e3de' }}>
            {rep.name}
          </p>
          <p className="text-[10px] mt-0.5 truncate" style={{ color: '#6b6460' }}>
            {rep.region}
          </p>
        </div>
      </div>

      {/* Contacts */}
      <div className="px-3 pb-2.5 space-y-1" style={{ borderTop: '1px solid #2e2b28' }}>
        <a
          href={`tel:${rep.phone.replace(/\s/g, '')}`}
          className="flex items-center gap-2 pt-2 group"
        >
          <PhoneIcon color={rep.color} />
          <span className="text-[11px] group-hover:underline" style={{ color: '#9a948e' }}>
            {rep.phone}
          </span>
        </a>
        <a
          href={`mailto:${rep.email}`}
          className="flex items-center gap-2 group"
        >
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
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ shrink: 0 }}>
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
