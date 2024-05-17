// types.ts

export interface RedditPostData {
  id: string;
  title: string;
  subreddit: string;
  author: string;
  thumbnail: string | null;
  permalink: string;
  score: number;
  num_comments: number;
  is_video: boolean;
  media?: {
    reddit_video?: {
      fallback_url: string;
      // Add other video-related properties as needed
    };
  };
  preview?: {
    images: {
      source: {
        url: string;
        width: number;
        height: number;
      };
      resolutions: {
        url: string;
        width: number;
        height: number;
      }[];
      variants: {
        [key: string]: {
          source: {
            url: string;
            width: number;
            height: number;
          };
          resolutions: {
            url: string;
            width: number;
            height: number;
          }[];
        };
      };
      id: string;
    }[];
    enabled: boolean;
  };
}


export interface RedditApiResponse {
  kind: string;
  data: {
    children: RedditPost[]; // Use the RedditPost interface for children
    after: string | null;
    before: string | null;
  };
}

// Updated interface to match the data structure of children in the Reddit API response
export interface RedditPost {
  kind: string;
  data: RedditPostData;
}

//Interface used for the savesubreddit fetch call
interface SavedSubreddit {
  name: string; 
}
