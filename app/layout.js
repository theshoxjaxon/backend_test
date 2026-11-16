import './globals.css';

export const metadata = {
  title: 'Talaba Test Tizimi — Bilim Baholash',
  description: 'Talabalar uchun zamonaviy va tezkor online imtihon tizimi',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>
        {children}
      </body>
    </html>
  );
}
