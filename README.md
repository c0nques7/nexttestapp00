**MyHome Component
Overview
The MyHome component is the main hub of the PeakeFeed application. It dynamically fetches and displays a variety of content, including user posts, financial data (stock tickers), and Reddit posts. The component provides a customizable layout where users can rearrange content cards through drag-and-drop interactions.
Functionality
 * Content Display: Renders PostCard, FinancialCard, and RedditCard components based on fetched data.
 * Data Fetching: Utilizes useEffect hooks to fetch:
   * User posts from the /api/fetchposts endpoint.
   * Application settings from the /api/settings endpoint.
   * Saved stock ticker symbols from the /api/tickers endpoint.
 * Stock Search: Allows users to search for stock symbols and add them to their watchlist if the stock search feature is enabled.
 * Reddit Search: Enables searching for subreddits and displaying relevant posts.
 * Create Post Modal: Provides a modal dialog (CreatePost) for users to create new posts.
 * Sidebar: Offers navigation links and a toggle button to expand/collapse the sidebar.
 * Card Positioning: Leverages CardPositionsProvider and useCardPositions from the cardPositionsContext to manage and persist the positions of draggable cards.
 * Conditional Rendering: UI elements like stock search and Reddit search are displayed conditionally based on user settings fetched from the API.
State Management
The MyHomePage component utilizes the useState hook to manage the following:
 * isDropdownOpen: Controls the visibility of a dropdown menu.
 * userPosts: Stores the fetched user posts.
 * stockData: Holds the fetched stock data for a selected ticker symbol.
 * symbol: Stores the current stock ticker symbol being searched.
 * error: Contains any error messages related to data fetching or user input.
 * tickers: Stores the list of saved ticker symbols.
 * showChart: Controls the visibility of the stock chart.
 * isLoading: Indicates whether data is being loaded.
 * isSidebarOpen: Determines if the sidebar is expanded or collapsed.
 * isStockSearchEnabled, isRedditSearchEnabled: Flags to toggle stock and Reddit search features.
 * showCreatePostModal: Controls the visibility of the create post modal.
 * subreddit: Stores the name of the subreddit being searched.
 * redditSearchResults: Holds the results from the Reddit search.
 * expandedPostId, expandedPostIdString: Manage the expanded state of individual posts.
 * tickerSymbols: Array of saved ticker symbols.
Interactions
 * Drag-and-Drop: Users can drag and drop content cards to customize their layout.
 * Stock Search: When the stock search bar is enabled, users can enter a symbol and click "Search" to fetch and display the corresponding stock chart.
 * Add Ticker: The handleAddTicker function allows users to add a ticker to their watchlist by calling the /api/tickers API endpoint.
 * Reddit Search: If enabled, users can enter a subreddit name and click "Search" to fetch and display posts from that subreddit.
 * Create Post: Clicking the floating action button (FAB) opens the CreatePost modal.
 * Sidebar Toggle: The "☰" button toggles the sidebar's expanded state.
Dependencies
 * PostCard
 * FinanceCard
 * RedditCard
 * CreatePost
 * cardPositionsContext
 * tickerContext
 * useRouter (Next.js)
 * html-react-parser
 * moment
 * MUI components (e.g., Fab, AddIcon)
Potential Improvements
 * Error Handling: Enhance error handling to provide more specific feedback to the user in case of API or network errors.
 * Data Caching: Implement caching for fetched data to improve performance and reduce API calls.
 * Code Optimization: Refactor components and logic for better maintainability and readability.
 * Additional Features: Consider adding features like filtering, sorting, or infinite scrolling for enhanced user experience.
Let me know if you have any other questions.
