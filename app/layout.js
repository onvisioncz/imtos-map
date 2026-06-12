import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'IMTOS – Mapa obchodního zastoupení',
  description: 'Interaktivní mapa obchodních zástupců IMTOS dle PSČ pro ČR a SK',
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs" className={inter.variable}>
      <body style={{ margin: 0, height: '100%' }}>{children}</body>
    </html>
  );
}
