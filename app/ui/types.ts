export interface RedditPostData {
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
  preview?: {  // Make preview optional
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
  kind: string;  // Add the kind property
  data: {
    children: {
      kind: string; // Add the kind property
      data: RedditPostData;
    }[];
    after: string | null; // Add the after property
    before: string | null; // Add the before property
  };
}