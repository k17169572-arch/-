import './globals.css';

export const metadata = {
  title: 'WINTERFELL LAYOUT | Member Directory',
  description: 'Premium Member Directory',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
