import { NextResponse } from 'next/server';

interface RedditPost {
  id: string;
  title: string;
  subreddit: string;
  permalink: string;
  // ... other properties as needed
}

interface RedditApiResponse {
  data: {
    children: {
      data: RedditPost;
    }[];
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get('subreddit') || '';

  // Input validation
  if (!subreddit.trim()) {
    return NextResponse.json({ error: 'Subreddit name is required' }, { status: 400 });
  }

  try {
    // Fetch data directly from the subreddit
    const response = await fetch(`https://www.reddit.com/r/${subreddit}/.json`); // Use the .json suffix
    
    if (!response.ok) {
      throw new Error(`Reddit API returned status ${response.status}`);
    }

    const data: RedditApiResponse = await response.json();
    // Data validation (ensure expected structure)
    if (!data || !data.data || !Array.isArray(data.data.children)) {
      throw new Error("Unexpected Reddit API response format");
    }

    const posts = data.data.children.slice(0, 10).map((child) => ({ 
        id: child.data.id,
        title: child.data.title,
        subreddit: child.data.subreddit,
        url: `https://www.reddit.com${child.data.permalink}`,
      // ... other properties you need
    }));

    return NextResponse.json(posts);
  } catch (error: any) {
    console.error("Error fetching subreddit data:", error.message);
    return NextResponse.json({ error: error.message || 'Failed to fetch subreddit data' }, { status: 500 });
  }}