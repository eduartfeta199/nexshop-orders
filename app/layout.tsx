import './globals.css';

export const metadata = {
  title: 'NexShop Orders Dashboard',
  description: 'Order management dashboard with Supabase',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
