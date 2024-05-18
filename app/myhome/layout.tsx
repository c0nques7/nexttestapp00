// app/myhome/layout.tsx
import { Suspense, ReactNode } from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'My Home | Your App Name',
  description: 'Your personalized feed',
};

interface MyHomeLayoutProps {
    children: ReactNode;
  }

export default function MyHomeLayout({ children }: MyHomeLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#79966e]">
      {/* Header (optional) */}
      <header className="">
        {/* Your header content here */}
        <div className="fixed top-4 right-4 z-10">
      </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center p-8">
        <Suspense fallback={<div className="neumorphic p-8 w-full max-w-4xl rounded-lg">Loading...</div>}>
          {children}
        </Suspense>
      </main>

      {/* Footer (optional) */}
      <footer className="">
        {/* Your footer content here */}
      </footer>
    </div>
  );
}
