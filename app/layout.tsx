import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'NexShop Orders Dashboard',
  description: 'Order management dashboard with Supabase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />

        {children}
      </body>
    </html>
  );
}