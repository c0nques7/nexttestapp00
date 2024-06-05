## PeakeFeed

PeakeFeed is a dynamic web application designed to consolidate and display various types of content in a visually engaging way. It integrates with a backend API to fetch user posts, financial data (stock tickers), and Reddit content. The frontend is built using React and Next.js, allowing for interactive user experiences like draggable cards and dynamic content loading.
Features
 * User Posts:  Display user-generated content, including text, images, and videos, fetched from a backend API.
 * Financial Data:
   * Search for stock tickers and view their charts.
   * Add tickers to a watchlist (potentially stored in a database).
 * Reddit Integration:
   * Search for subreddits and display posts.
   * View details of Reddit posts (e.g., comments, score).
 * Draggable Cards: Users can rearrange content cards to customize their layout.
 * Conditional Rendering: UI elements (like stock search and Reddit search) can be toggled on/off based on settings.
 * Modal for Creating Posts: A user-friendly modal allows users to create new posts.
 * Responsive Design: The application adapts to different screen sizes for optimal viewing.
Technical Stack
 * Frontend:
   * React
   * Next.js (App Router)
   * Recharts (for charting)
   * React Draggable (for drag-and-drop)
   * MUI (Material UI for styling)
 * Backend:
   * Next.js API Routes (for data fetching)
   * Prisma (ORM for database interaction)
   * PostgreSQL (or your preferred database)
 * External APIs:
   * Financial data API (e.g., Alpha Vantage, Finnhub)
   * Reddit API

Project Structure

app/

├── components/          
│   ├── FinanceCard/    
│   ├── PostCard/       
│   ├── RedditCard/    
│   └── CreatePost/     
├── context/            
│   ├── cardPositionsContext.tsx  
│   └── tickerContext.tsx   
├── myhome/
│   └── page.tsx       
├── styles/             
│   └── global.css     
└── lib/
    └── types.ts    

Components
 * FinancialCard: Displays a stock ticker chart and allows adding it to a watchlist.
 * PostCard: Displays a user-generated post (text, image, or video).
 * RedditCard: Displays a post from Reddit.
 * CreatePost: A modal component for creating new posts.
Context
 * cardPositionsContext: Manages the positions of draggable cards.
 * tickerContext: Stores the list of saved stock tickers.
Data Flow
 * MyHomePage fetches:
   * User posts from /api/fetchposts
   * Settings from /api/settings
   * Saved ticker symbols from /api/tickers
 * User can:
   * Search for and add new stock tickers (calls /api/tickers POST)
   * Search for and view Reddit posts
   * Create new posts
 * FinancialCard components render based on fetched/saved tickers.
 * PostCard and RedditCard components render based on fetched data.
Key Challenges and Solutions
 * Drag-and-Drop: Implemented using react-draggable and persisted positions using local storage or a database.
 * API Integration: Used Next.js API routes to fetch data from external APIs (financial data and Reddit) and the backend database.
 * Authentication: Protected API routes using JWT (JSON Web Tokens) stored in cookies.
