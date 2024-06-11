// app/login/layout.tsx
import type { Metadata } from 'next';
import '@/app/styles/global.css';

export const metadata: Metadata = {
  title: 'Login | YourAppName',
  description: 'Log in to your account',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center">
        {/* Main Content Container */}
        <main className="p-8 w-full max-w-md rounded-lg">
          {children} 
        </main>
      </body>
    </html>
  );
}