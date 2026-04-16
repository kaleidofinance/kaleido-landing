// Define the task fields we want to cache
export type TaskType = 
  | 'twitterTaskClaimed'
  | 'twitterCommentTaskClaimed'
  | 'twitterCommentBackTaskClaimed'
  | 'twitterScreenshotTaskClaimed'
  | 'twitterKaleidoTaskClaimed'
  | 'twitterPartnershipTaskClaimed'
  | 'twitterFounderTaskClaimed'
  | 'twitterThreadTaskClaimed'
  | 'twitterThreadCommentTaskClaimed'
  | 'twitterMubeenPostTaskClaimed'
  | 'twitterMubeenFollowTaskClaimed'
  | 'twitterDiscordMilestoneTaskClaimed'
  | 'twitterXUpdateTaskClaimed'
  | 'twitterKaleidoNftTaskClaimed'
  | 'twitterMubeenNftTaskClaimed'
  | 'twitterSecurityPartnershipClaimed'
  | 'faithfulTaskClaimed'
  | 'easterTaskClaimed'
  | 'awakenedTaskClaimed'
  | 'bullishTaskClaimed'
  | 'inviteTaskClaimed'
  | 'miningTaskClaimed'
  | 'founderTaskClaimed'
  | 'misesTaskClaimed'
  | 'newmisesTaskClaimed'
  | 'lockedTaskClaimed'
  | 'superTaskClaimed'
  | 'newTaskClaimed'
  | 'testnetTaskClaimed'
  | 'getreadyTaskClaimed';


class TaskCompletionCache {
  private static instance: TaskCompletionCache;
  private cache: Map<string, Set<TaskType>>;
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): TaskCompletionCache {
    if (!TaskCompletionCache.instance) {
      TaskCompletionCache.instance = new TaskCompletionCache();
    }
    return TaskCompletionCache.instance;
  }

  public setTaskComplete(walletAddress: string, taskType: TaskType): void {
    const userTasks = this.cache.get(walletAddress) || new Set();
    userTasks.add(taskType);
    this.cache.set(walletAddress, userTasks);

    // Clear cache after duration
    setTimeout(() => {
      const tasks = this.cache.get(walletAddress);
      if (tasks) {
        tasks.delete(taskType);
        if (tasks.size === 0) {
          this.cache.delete(walletAddress);
        }
      }
    }, this.CACHE_DURATION);
  }

  public isTaskComplete(walletAddress: string, taskType: TaskType): boolean {
    const userTasks = this.cache.get(walletAddress);
    return userTasks ? userTasks.has(taskType) : false;
  }

  public clearUserCache(walletAddress: string): void {
    this.cache.delete(walletAddress);
  }
}

export const taskCache = TaskCompletionCache.getInstance();
