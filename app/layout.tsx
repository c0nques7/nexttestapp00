// app/layout.tsx
import '@/app/styles/global.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <div className="min-h-screen flex flex-col"> {/* Full-height container */}
          <header className=""> {/* Neumorphic header */}
            {/* Your header content (e.g., logo, navigation) goes here */}
          </header>

          <main className="flex-grow items-center justify-center w-full max-w-4xl"> {/* Main content area, takes up remaining space */}
            {children}
          </main>

          <footer className=""> {/* Neumorphic footer */}
            {/* Your footer content goes here */}
          </footer>
        </div>
      </body>
    </html>
  );
}