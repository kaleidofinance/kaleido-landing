export type RegistrationStep = 'details' | 'username' | 'social' | 'verification' | 'completion';

export interface SocialTasks {
  twitter: boolean;
  telegram: boolean;
  discord: boolean;
}

export interface ContentSubmission {
  url: string;
  type: 'article' | 'video' | 'social';
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewStatus: 'under_review' | 'reviewed';
  pendingReward: number;
  rewardClaimed?: boolean;
}

export interface RegistrationData {
  email: string;
  walletAddress: string;
  socialTasks: {
    twitter: boolean;
    telegram: boolean;
    discord: boolean;
  };
  agreedToTerms: boolean;
  referralCode?: string;
  referredBy?: string;
  referralCount: number;
  referralBonus: number;
  twitterTaskClaimed?: boolean;
  twitterCommentTaskClaimed?: boolean;
  twitterCommentBackTaskClaimed?: boolean;
  twitterScreenshotTaskClaimed?: boolean;
  twitterKaleidoTaskClaimed?: boolean;
  twitterPartnershipTaskClaimed?: boolean;
  twitterFounderTaskClaimed?: boolean;
  twitterThreadTaskClaimed?: boolean;
  twitterThreadCommentTaskClaimed?: boolean;
  twitterMubeenPostTaskClaimed?: boolean;
  twitterMubeenFollowTaskClaimed?: boolean;
  twitterDiscordMilestoneTaskClaimed?: boolean;
  twitterXUpdateTaskClaimed?: boolean;
  twitterKaleidoNftTaskClaimed?: boolean;
  twitterMubeenNftTaskClaimed?: boolean;
  twitterSecurityPartnershipClaimed?: boolean;
  faithfulTaskClaimed?: boolean;
  easterTaskClaimed?: boolean;
  awakenedTaskClaimed?: boolean;
  bullishTaskClaimed?: boolean;
  inviteTaskClaimed?: boolean;
  miningTaskClaimed?: boolean;
  founderTaskClaimed?: boolean;
  misesTaskClaimed?: boolean;
  newmisesTaskClaimed?:boolean;
  lockedTaskClaimed?: boolean;
  superTaskClaimed?: boolean;
  newTaskClaimed?: boolean;
  testnetTaskClaimed?: boolean;
  getreadyTaskClaimed?: boolean;
  xId?: string; // X (Twitter) user ID
  xFollowing?: boolean; // Whether the user follows the project X handle
  xProfile?: any; // Store X profile info (optional, can be typed later)

  balance?: number;
  lastUpdated?: string;
  registeredAt?: Date;
  status?: 'pending' | 'approved' | 'rejected';
  xUsername?: string;
  contentSubmissions?: ContentSubmission[];
  lastContentSubmission?: string; // ISO string for last submission time
}

export interface RegistrationResponse {
  message?: string;
  error?: string;
  registration?: RegistrationData & {
    registeredAt: Date;
    status: 'pending' | 'approved' | 'rejected';
  };
}
