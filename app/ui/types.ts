// types.ts

// Main Post Data Interface (RedditPostData)
export interface RedditPostData {
  id: string;
  title: string;
  subreddit: string;
  author: string;
  thumbnail: string | null;
  permalink: string;
  url: string; // Added `url` property for post's direct link
  score: number;
  num_comments: number;
  is_video: boolean;

  // Optional Media Properties (For Video Posts)
  media?: {
    reddit_video?: {
      fallback_url: string;
      // Add other video properties like height, width, duration, etc. if needed
    };
  };

  // Optional Preview Properties (For Image Posts)
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
        gif?: { // Added optional 'gif' variant
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
        mp4?: { // Added optional 'mp4' variant
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
        // ...other potential variants like 'nsfw'
      };
      id: string;
    }[];
    enabled: boolean;
  };
}

// API Response Interface (RedditApiResponse)
export interface RedditApiResponse {
  kind: string;
  data: {
    children: {
      kind: string;
      data: RedditPostData;
    }[]; 
    after: string | null;
    before: string | null;
  };
}

// Interface for Saved Subreddits (for Fetch Calls)
export interface SavedSubredditResponse {
  mySubs: string[];
}
