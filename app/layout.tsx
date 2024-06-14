// app/layout.tsx
import '@/app/styles/global.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      <body>
      
        <div> {/* Full-height container */}
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