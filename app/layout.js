import './globals.css';

export const metadata = {
  title: 'IMTOS – Mapa obchodních regionů',
  description: 'Interaktivní mapa obchodních zástupců IMTOS dle PSČ pro ČR a SK',
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body style={{ margin: 0, height: '100%' }}>{children}</body>
    </html>
  );
}
