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
      <body>
        <div > {/* Full-height container */}
          <header> {/* Neumorphic header */}
            {/* Your header content (e.g., logo, navigation) goes here */}
          </header>

          <main> {/* Main content area, takes up remaining space */}
            {children}
          </main>

          <footer> {/* Neumorphic footer */}
            {/* Your footer content goes here */}
          </footer>
        </div>
      </body>
    </html>
  );
}