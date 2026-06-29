import { Archivo, Inter } from 'next/font/google';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-archivo',
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'IMTOS – Mapa obchodního zastoupení',
  description: 'Interaktivní mapa obchodních zástupců IMTOS dle PSČ pro ČR a SK',
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs" className={`${archivo.variable} ${inter.variable}`}>
      <body style={{ margin: 0, height: '100%' }}>{children}</body>
    </html>
  );
}
