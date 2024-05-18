// app/register/layout.tsx
import type { Metadata } from 'next';
import '@/app/styles/global.css';  // Import global styles

export const metadata: Metadata = {
  title: 'Register | YourAppName',
  description: 'Create your account and join our community',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#79966e]">
        {/* Main Content Container */}
        <main className="neumorphic p-8 w-full max-w-md rounded-lg">
          {children} 
        </main>
      </body>
    </html>
  );
}