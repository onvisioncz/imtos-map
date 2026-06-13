import dynamic from 'next/dynamic';
import { salesReps } from '@/lib/data';
import SidebarRepCard from '@/components/SidebarRepCard';
import MobileRepStrip from '@/components/MobileRepStrip';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full" style={{ background: '#f5f5f4' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D41029] mx-auto mb-3" />
        <p className="text-sm tracking-wide" style={{ color: '#a8a29e' }}>Načítám mapu…</p>
      </div>
    </div>
  ),
});

const ImtosLogo = ({ width = 150 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 184.389 72.924" style={{ width, height: 'auto' }} aria-label="IMTOS">
    <path fill="#FFFFFF" d="M108.798,21.355c-4.515,0-8.05,1.429-10.505,4.249c-2.31,2.651-3.53,6.501-3.53,11.13v4.636c0,4.629,1.22,8.478,3.53,11.13c2.455,2.82,5.99,4.25,10.505,4.25c4.456,0,8.1-1.469,10.538-4.249c2.33-2.657,3.562-6.507,3.562-11.132v-4.636c0-4.625-1.232-8.474-3.562-11.131C116.899,22.824,113.255,21.355,108.798,21.355z M101.12,36.733c0-6.43,2.582-9.689,7.677-9.689c2.606,0,4.582,0.862,5.872,2.563c1.239,1.632,1.866,4.03,1.866,7.126v4.636c0,3.108-0.635,5.513-1.887,7.147c-1.293,1.688-3.262,2.543-5.851,2.543c-5.094,0-7.677-3.261-7.677-9.691L101.12,36.733L101.12,36.733z"/>
    <path fill="#FFFFFF" d="M143.047,37.772l-6.043-3.601c-2.629-1.543-3.964-2.618-3.964-4.208c0-2.586,1.669-3.041,5.177-3.041c3.674,0,7.994,0.366,9.413,0.486l0.224,0.002c0.946,0,1.533-0.586,1.533-1.533v-2.01c0-0.935-0.576-1.559-1.571-1.71c-3.124-0.531-6.353-0.8-9.599-0.8c-7.763,0-11.536,2.816-11.536,8.608c0,3.616,1.991,6.438,6.463,9.148l6.16,3.66c3.361,2.006,4.332,3.046,4.332,4.637c0,2.759-1.554,3.835-5.542,3.835c-2.22,0-6.666-0.311-9.514-0.667l-0.306-0.004c-0.907,0-1.592,0.606-1.592,1.41v2.136c0,0.602,0.289,1.385,1.659,1.7c2.803,0.687,7.007,0.931,9.754,0.931c3.659,0,6.538-0.734,8.556-2.182c2.222-1.594,3.348-4.003,3.348-7.159C149.998,43.427,148.048,40.724,143.047,37.772z"/>
    <path fill="#FFFFFF" d="M59.709,21.294c-3.786,0-7.232,0.712-10.24,2.115c-1.646-1.459-3.911-2.115-7.266-2.115c-4.306,0-8.747,1.068-13.202,3.175l-0.285,0.135v30.003c0,0.978,0.659,1.716,1.533,1.716h3.233c0.784,0,1.595-0.642,1.595-1.716V28.098c2.064-0.721,4.214-1.117,6.091-1.117c2.353,0,5.054,0.686,5.054,6.032v21.592c0,0.978,0.659,1.716,1.534,1.716h3.233c0.985,0,1.594-0.891,1.594-1.716V32.89c0-0.513-0.016-1.032-0.052-1.59l-0.003-0.041c-0.013-0.199-0.028-0.394-0.047-0.58c-0.011-0.13-0.024-0.257-0.038-0.382c-0.001-0.009-0.002-0.02-0.003-0.029l-0.001-0.005c-0.071-0.647-0.169-1.259-0.294-1.828c2.6-0.963,4.794-1.452,6.525-1.452c2.354,0,5.056,0.686,5.056,6.032v21.592c0,0.947,0.77,1.716,1.716,1.716h2.928c0.947,0,1.717-0.769,1.717-1.716V33.014C70.088,27.668,68.288,21.294,59.709,21.294z"/>
    <path fill="#FFFFFF" d="M89.727,51.426h-3.415c-2.079,0-2.798-0.162-2.798-3.346V27.288h5.951c0.945,0,1.714-0.769,1.714-1.715v-2.075c0-0.947-0.768-1.716-1.714-1.716h-5.951v-6.151c0-0.859-0.62-1.533-1.411-1.533h-3.54c-0.791,0-1.41,0.674-1.41,1.533v32.45c0,7.252,3.223,8.671,8.79,8.671c1.175,0,2.798-0.125,4.042-0.31c1.256-0.195,1.519-0.939,1.519-1.529v-2.134C91.505,52.16,91.197,51.426,89.727,51.426z"/>
    <path fill="#D41029" d="M14.015,32.881c-0.877,1.596-0.877,3.412-0.877,6.159l0.009,7.686l0.011,7.879c0,0.946,0.769,1.715,1.716,1.715h4.055c0.947,0,1.716-0.769,1.716-1.715l0.008-4.495h0.003V27.668l-0.741,0.42C16.456,30.051,14.857,31.35,14.015,32.881z"/>
    <path fill="#D41029" d="M20.911,17.691c0.06-1.62-0.643-3.089-1.98-4.136c-1.525-1.195-3.708-1.665-5.431-1.17l-0.359,0.103v14.297l0.741-0.421C19.496,23.179,20.744,21.639,20.911,17.691z"/>
  </svg>
);

const FlagCZ = () => (
  <svg width="16" height="11" viewBox="0 0 16 11" style={{ borderRadius: 2, flexShrink: 0 }} aria-hidden>
    <rect width="16" height="5.5" fill="#fff" />
    <rect y="5.5" width="16" height="5.5" fill="#d7141a" />
    <path d="M0 0 L7 5.5 L0 11 Z" fill="#11457e" />
  </svg>
);

const FlagSK = () => (
  <svg width="16" height="11" viewBox="0 0 16 11" style={{ borderRadius: 2, flexShrink: 0 }} aria-hidden>
    <rect width="16" height="3.67" fill="#fff" />
    <rect y="3.67" width="16" height="3.67" fill="#0b4ea2" />
    <rect y="7.33" width="16" height="3.67" fill="#ee1c25" />
  </svg>
);

function SectionHeader({ flag, label }) {
  return (
    <div className="flex items-center gap-2.5 mb-2 px-2">
      {flag}
      <span style={{ color: 'var(--text-low)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--hairline-soft)' }} />
    </div>
  );
}

export default function HomePage() {
  const allReps = Object.values(salesReps);
  const czReps = allReps.filter((r) => !r.region.includes('Slovensko'));
  const skReps = allReps.filter((r) => r.region.includes('Slovensko'));

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">

      {/* ── MOBILE sidebar (below map) ── */}
      <aside
        className="md:hidden w-full shrink-0 flex flex-col z-10 order-2"
        style={{ background: 'var(--bg-sidebar)', height: '38vh' }}
      >
        <div className="flex items-center gap-3 px-4 py-2 shrink-0" style={{ background: 'var(--bg-header)' }}>
          <div className="logo-pulse" style={{ display: 'inline-block' }}>
            <ImtosLogo width={86} />
          </div>
          <div className="pl-3" style={{ borderLeft: '1px solid var(--hairline)' }}>
            <p style={{ color: 'var(--text-mid)', fontSize: 9.5, fontWeight: 650, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Mapa obchodního zastoupení
            </p>
            <p className="mt-0.5" style={{ color: 'var(--text-low)', fontSize: 9, fontWeight: 450 }}>
              Vyberte oblast svého obchodníka
            </p>
          </div>
        </div>
        <div className="h-[2px] shrink-0" style={{ background: 'linear-gradient(90deg, var(--accent) 0%, rgba(212,16,41,0.35) 55%, transparent 100%)' }} />
        <MobileRepStrip reps={allReps} />
      </aside>

      {/* ── DESKTOP sidebar ── */}
      <aside
        className="hidden md:flex w-80 lg:w-[370px] shrink-0 flex-col z-10 overflow-hidden order-1"
        style={{ background: 'var(--bg-sidebar)' }}
      >
        {/* Logo block */}
        <div className="px-7 pt-8 pb-6" style={{ background: 'var(--bg-header)' }}>
          <div className="logo-pulse" style={{ display: 'inline-block' }}>
            <ImtosLogo />
          </div>
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--hairline)' }}>
            <p style={{ color: 'var(--text-mid)', fontSize: 11, fontWeight: 650, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              Realizujeme vaše vize
            </p>
            <p className="mt-1" style={{ color: 'var(--text-low)', fontSize: 11, fontWeight: 450 }}>
              Mapa obchodního zastoupení
            </p>
          </div>
        </div>
        <div className="h-[2px] w-full shrink-0" style={{ background: 'linear-gradient(90deg, var(--accent) 0%, rgba(212,16,41,0.35) 55%, transparent 100%)' }} />

        {/* Rep list */}
        <div className="imtos-scroll flex-1 overflow-y-auto px-4 pt-6 pb-4">
          <section>
            <SectionHeader flag={<FlagCZ />} label="Česká republika" />
            <div className="space-y-0.5">
              {czReps.map((rep) => <SidebarRepCard key={rep.id} rep={rep} />)}
            </div>
          </section>

          <section className="mt-7">
            <SectionHeader flag={<FlagSK />} label="Slovensko" />
            <div className="space-y-0.5">
              {skReps.map((rep) => <SidebarRepCard key={rep.id} rep={rep} />)}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-7 py-3.5 flex items-center gap-2.5 shrink-0" style={{ borderTop: '1px solid var(--hairline-soft)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-low)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9 18l6-6-6-6" />
          </svg>
          <p style={{ color: 'var(--text-low)', fontSize: 11, fontWeight: 450 }}>
            Klikněte na oblast v mapě pro detail a kontakt
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
