// app/layout.tsx
'use client'
import '@/app/styles/global.css';
import { BrowserRouter } from 'react-router-dom';
import React, { useState, useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [BrowserRouter, setBrowserRouter] = useState<any>(null); // Initialize as null

  useEffect(() => {
    async function importBrowserRouter() {
      const routerModule = await import("react-router-dom");
      setBrowserRouter(() => routerModule.BrowserRouter);
    }
    importBrowserRouter(); // Fetch the module
  }, []); // Empty dependency array ensures this runs only once after mount

  if (!BrowserRouter) {
    return null; // Don't render until BrowserRouter is loaded
  }

  return (
    <html lang="en">
      <head>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body>
        <div> {/* Full-height container */}
            <header> {/* Neumorphic header */}
            {/* Your header content (e.g., logo, navigation) goes here */}
            </header>

          <main> {/* Main content area, takes up remaining space */}
            <BrowserRouter>
            {children}
            </BrowserRouter>
          </main>

          <footer> {/* Neumorphic footer */}
            {/* Your footer content goes here */}
          </footer>
        </div>
      </body>
    </html>
  );
}