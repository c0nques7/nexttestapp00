// types.ts

import { Role, Prisma, User, ContentProvider, PostType } from "@prisma/client";

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
  timestamp: Date;  
  parentId?: number | null;
  showDeleteCover: boolean;
  ref: React.RefObject<HTMLDivElement>;
  user?: {
    id: number;
    username: string;
    email: string;
    passwordHash: string;
    isVerified: boolean;
    role: Role;       // Assuming you have a Role enum defined elsewhere
    ethereumAddress: string | null;
    settings: Prisma.JsonValue; // Assuming Prisma.JsonValue is imported
  };
  post?: { 
    id: number; 
    // ...other post properties if needed
  };
  votes: {
    id: number;
    userId: number;
    postId: number;
    voteValue: number;
    transactionHash: string | null;
    commentId: number | null;
  }[];
  replies?: Comment[];
  flags?: any[];  // Replace 'any' with the actual type if known  // Recursive structure for nested replies
}

export interface Vote {
  id: number;
  userId: number;
  postId: number;
  voteValue: number;
  transactionHash: string | null;
  commentId: number | null;
  user: User; 
}

export interface Flag {
  id: number;
  userId: number;
  user: {
    id: number;
    // ...other user fields if needed (e.g., username)
  } | null;
  postId: number;
  post: {
    id: number;
    // ...other post fields if needed
  } | null;
  reason: string;
  commentId?: number | null; // Optional, as not all flags are for comments
  comment?: Comment | null; // Optional, and can be null if not fetched
}

export interface Channel{
  id: number;
  name: string;
  isCorpAccount: boolean;
  
}

export interface CreatePostRequestBody {
  content: string;
    postType: PostType;
    contentProvider?: string; 
    mediaUrl?: string | null;
    isPublic?: boolean;
    transactionHash?: string | null;
    postDestination: 'SELF' | 'CHANNEL'; // Add postDestination
    channelId?: number | null; 
    channelName?: string | null;
}

export interface Post {
  userId?: number;
  channel: Channel | null;
  channelId?: number;
  contentProvider?: ContentProvider;
  channelName?: string | null;
  id: number;
  title?: string;
  content?: string;
  subreddit?: string;
  author?: string;
  timestamp: string;
  mediaUrl?: string;
  postType?: 'TEXT' | 'IMAGE' | 'VIDEO';
  permalink?: string;
  thumbnail?: string | null;
  url?: string;
  score?: number;
  num_comments?: number;
  is_video?: boolean;
  created_utc?: number;
}


