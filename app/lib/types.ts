// types.ts

// Main Post Data Interface (RedditPostData)
export interface RedditPostData {
  contentProvider: "REDDIT";
  id: string;
  title: string;
  subreddit: string;
  author: string;
  thumbnail: string | null;
  permalink: string;
  url: string; // Added `url` property for post's direct link
  post_hint?: string;
  score: number;
  num_comments: number;
  is_video: boolean;
  created_utc: number;
  timestamp: Date;

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
    after?: string | null;
    dist?: number | null;
    modhash: string;
    geo_filter: string | null;
    children: Array<{
      kind: string;
      data: RedditPostData;
    }>;
    before?: string | null;
  };
}

// Interface for Saved Subreddits (for Fetch Calls)
export interface SavedSubredditResponse {
  mySubs: string[];
}

export interface PeakeFeedPost {
  contentProvider: "PEAKEFEED"; // This explicitly sets the content provider
  id: string; // or number if your IDs are numbers
  content: string; // Assuming you have a 'content' property
  userId: number;
  channel: string;
  timestamp: Date; 
  mediaUrl?: string; // Optional for media attachments
  // Add any other properties specific to PeakeFeed posts here
}

export interface Comment {
  id: number;
  userId: number;
  postId: number;
  content: string;
  timestamp: string; // Or Date if you're storing as Date objects
  user?: {   
      id: number
      name: string;
    }
  // ... other properties you might have ...
}
