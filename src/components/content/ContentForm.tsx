'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useWeb3 } from '@/providers/Web3Provider';
import { ContentSubmission } from '@/types/registration';

interface ContentFormProps {
  onSubmit?: (success: boolean) => void;
}

// Cooldown period in milliseconds (3 hours)
const SUBMISSION_COOLDOWN = 3 * 60 * 60 * 1000;

// Local storage keys
const STORAGE_KEYS = {
  lastSubmission: 'kaleido_last_submission',
  cooldownRemaining: 'kaleido_cooldown_remaining',
  lastCheck: 'kaleido_last_check'
};

export default function ContentForm({ onSubmit }: ContentFormProps) {
  const { account } = useWeb3();
  const [url, setUrl] = useState('');
  const [type, setType] = useState<'article' | 'video' | 'social'>('article');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.cooldownRemaining);
      if (stored) {
        const remaining = parseInt(stored, 10);
        const lastCheck = parseInt(localStorage.getItem(STORAGE_KEYS.lastCheck) || '0', 10);
        const elapsed = Date.now() - lastCheck;
        return Math.max(0, remaining - elapsed);
      }
    }
    return 0;
  });
  const [lastSubmission, setLastSubmission] = useState<ContentSubmission | null>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.lastSubmission);
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  // Persist state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (lastSubmission) {
        localStorage.setItem(STORAGE_KEYS.lastSubmission, JSON.stringify(lastSubmission));
      }
      if (cooldownRemaining > 0) {
        localStorage.setItem(STORAGE_KEYS.cooldownRemaining, cooldownRemaining.toString());
        localStorage.setItem(STORAGE_KEYS.lastCheck, Date.now().toString());
      } else {
        // Clean up storage when cooldown is done
        localStorage.removeItem(STORAGE_KEYS.cooldownRemaining);
        localStorage.removeItem(STORAGE_KEYS.lastCheck);
      }
    }
  }, [lastSubmission, cooldownRemaining]);

  // Check cooldown status and load last submission
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (!account) return;

      try {
        const response = await fetch(`/api/testnet/check-registration?wallet=${account}`);
        const data = await response.json();

        if (data.isRegistered && data.userData.contentSubmissions?.length > 0) {
          // Always update lastSubmission with the latest backend data
          setLastSubmission(data.userData.contentSubmissions[0]);
          localStorage.setItem(
            STORAGE_KEYS.lastSubmission,
            JSON.stringify(data.userData.contentSubmissions[0])
          );
          // Check all pending submissions for auto-approval
          const now = Date.now();
          console.log('Checking submissions at:', new Date(now).toISOString());
          
          const pendingSubmissions = data.userData.contentSubmissions.filter((sub: ContentSubmission) => {
            const elapsed = now - new Date(sub.submittedAt).getTime();
            const isEligible = sub.status === 'pending' && elapsed >= SUBMISSION_COOLDOWN;
            console.log(`Submission ${sub.url}:`, {
              submittedAt: sub.submittedAt,
              elapsed: Math.floor(elapsed / 1000 / 60), // minutes
              isEligible
            });
            return isEligible;
          });

          console.log('Eligible submissions:', pendingSubmissions.length);

          // Auto-approve all eligible submissions
          if (pendingSubmissions.length > 0) {
            console.log('Sending auto-approve request for:', 
              pendingSubmissions.map((sub: ContentSubmission) => sub.url).join(', ')
            );
            
            const approveResponse = await fetch('/api/content/auto-approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                wallet: account,
                submissions: pendingSubmissions.map((sub: ContentSubmission) => sub.url)
              })
            });

            const approveData = await approveResponse.json();
            console.log('Auto-approve response:', approveData);
            
            if (approveData.updatedRegistration) {
              // Update last submission status
              setLastSubmission(approveData.updatedRegistration.contentSubmissions[0]);
              localStorage.setItem(
                STORAGE_KEYS.lastSubmission, 
                JSON.stringify(approveData.updatedRegistration.contentSubmissions[0])
              );

              // Calculate total points awarded
              const totalPoints = approveData.approvedSubmissions?.reduce(
                (total: number, sub: ContentSubmission) => total + sub.pendingReward, 
                0
              ) || 0;

              // Dispatch registration update event for mining dashboard
              window.dispatchEvent(new CustomEvent('registration-update', {
                detail: {
                  balance: approveData.updatedRegistration.balance,
                  contentTaskClaimed: true
                }
              }));

              // Update mining stats
              window.dispatchEvent(new CustomEvent('mining-stats', {
                detail: {
                  totalEarnings: approveData.updatedRegistration.balance,
                  sessionEarnings: totalPoints
                }
              }));

              // Show success toast for each approved submission
              approveData.approvedSubmissions?.forEach((submission: ContentSubmission) => {
                toast.success(`Content approved! Earned ${submission.pendingReward} points`, {
                  duration: 5000
                });
              });
            }
          }

          // Update cooldown for newest submission
          const latestSubmission = data.userData.contentSubmissions[0];
          const elapsed = now - new Date(latestSubmission.submittedAt).getTime();
          const remaining = Math.max(0, SUBMISSION_COOLDOWN - elapsed);
          setCooldownRemaining(remaining);

          // Update local storage
          localStorage.setItem(STORAGE_KEYS.cooldownRemaining, remaining.toString());
          localStorage.setItem(STORAGE_KEYS.lastCheck, now.toString());
        }
      } catch (error) {
        console.error('Error checking submission status:', error);
        toast.error('Failed to check submission status');
      }
    };

    // Initial check
    checkSubmissionStatus();
    
    // Check every minute
    const checkInterval = setInterval(checkSubmissionStatus, 60000);
    
    return () => clearInterval(checkInterval);
  }, [account]);

  // Update cooldown timer locally
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setCooldownRemaining(prev => {
          const newRemaining = Math.max(0, prev - 1000);
          if (newRemaining === 0) {
            // Clean up storage when cooldown is done
            if (typeof window !== 'undefined') {
              localStorage.removeItem(STORAGE_KEYS.cooldownRemaining);
              localStorage.removeItem(STORAGE_KEYS.lastCheck);
            }
          }
          return newRemaining;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [cooldownRemaining]);

  const formatCooldown = (ms: number) => {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    return { hours, minutes, seconds };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!url) {
      toast.error('Please enter a valid URL');
      return;
    }

    if (cooldownRemaining > 0) {
      const { hours, minutes, seconds } = formatCooldown(cooldownRemaining);
      toast.error(`Please wait ${hours}h ${minutes}m ${seconds}s before submitting again`);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/content/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          type,
          walletAddress: account,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit content');
      }

      toast.success('Content submitted successfully!');
      setUrl('');
      setLastSubmission(data.submission);
      setCooldownRemaining(SUBMISSION_COOLDOWN);
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.lastSubmission, JSON.stringify(data.submission));
        localStorage.setItem(STORAGE_KEYS.cooldownRemaining, SUBMISSION_COOLDOWN.toString());
        localStorage.setItem(STORAGE_KEYS.lastCheck, Date.now().toString());
      }
      
      onSubmit?.(true);
    } catch (error) {
      console.error('Content submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit content');
      onSubmit?.(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StatusBadge = ({ status, reviewStatus }: { status: string; reviewStatus: string }) => {
    const getStatusText = () => {
      if (status === 'approved') return 'Approved';
      if (status === 'rejected') return 'Rejected';
      return 'Pending';
    };

    const getStatusColor = () => {
      switch (status) {
        case 'approved': return 'text-green-400 border-green-400';
        case 'rejected': return 'text-red-400 border-red-400';
        default: return 'text-yellow-400 border-yellow-400';
      }
    };

    return (
      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()} border`}>
        {getStatusText()}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {lastSubmission && (
        <div className="relative p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-xl">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center transform hover:scale-105 transition-transform px-2">
            <span className="text-sm font-bold text-yellow-400 whitespace-nowrap">5000 Points</span>
          </div>

          <h3 className="text-xl font-semibold mb-4 text-white">Last Submission</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <a 
                href={lastSubmission.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 truncate"
              >
                {lastSubmission.url}
              </a>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <StatusBadge status={lastSubmission.status} reviewStatus={lastSubmission.reviewStatus} />
                <span className="text-sm text-gray-400">
                  {new Date(lastSubmission.submittedAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Type:</span>
                <span className="text-sm font-medium text-white capitalize">
                  {lastSubmission.type}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative space-y-4 max-w-lg mx-auto p-6 bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl">
        {cooldownRemaining > 0 && (
          <div className="absolute -top-5 -right-5 w-28 h-28">
            <div className="relative w-full h-full">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="50"
                  className="stroke-current text-gray-700"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="50"
                  className="stroke-current text-yellow-400"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${(1 - cooldownRemaining / SUBMISSION_COOLDOWN) * 314} 314`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-bold text-yellow-400">
                  {formatCooldown(cooldownRemaining).hours}h
                </span>
                <span className="text-sm text-yellow-400">
                  {formatCooldown(cooldownRemaining).minutes}m
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="url" className="block text-sm font-medium text-gray-200">
            Content URL
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
            className="w-full px-4 py-2 bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="type" className="block text-sm font-medium text-gray-200">
            Content Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as 'article' | 'video' | 'social')}
            className="w-full px-4 py-2 bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="article">Article</option>
            <option value="video">Video</option>
            <option value="social">Social Media Post</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || cooldownRemaining > 0}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all transform hover:scale-[1.02] ${
            isSubmitting || cooldownRemaining > 0
              ? 'bg-blue-600/50 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 active:scale-[0.98]'
          }`}
        >
          {isSubmitting ? 'Submitting...' : cooldownRemaining > 0 ? 'Cooldown Active' : 'Submit Content'}
        </button>

        {!cooldownRemaining && (
          <div className="mt-2 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm text-green-400">Ready to submit</span>
          </div>
        )}
      </form>
    </div>
  );
}
