"use client";
import { CardPositionsProvider } from '../context/cardPositionsContext';
import MyHomePage from '../myhome/page';

export default function Home() {
  return (
    <CardPositionsProvider>
      {/* Other layout components (if applicable) */}
      <div className="app-container">
        <header>
          {/* Your header content here */}
        </header>

        <main> 
          <MyHomePage />
        </main>

        <footer>
          {/* Your footer content here */}
        </footer>
      </div>
    </CardPositionsProvider>
  );
}