"use client";

import React, { useState, useEffect } from 'react';

interface SystemRequirement {
  name: string;
  description: string;
  status: 'checking' | 'passed' | 'failed' | 'warning';
  value?: string;
  minimum?: string;
  icon: React.ReactNode;
  details?: string;
}

const SystemCheck: React.FC = () => {
  const [requirements, setRequirements] = useState<SystemRequirement[]>([
    {
      name: 'CPU',
      description: 'Processor Check',
      status: 'checking',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Memory',
      description: 'RAM Check',
      status: 'checking',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: 'GPU',
      description: 'Graphics Check',
      status: 'checking',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Network',
      description: 'Connection Check',
      status: 'checking',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      ),
    },
  ]);

  useEffect(() => {
    const checkSystem = async () => {
      try {
        const cpuCheck = await checkCPU();
        updateRequirement('CPU', cpuCheck);
        const memoryCheck = await checkMemory();
        updateRequirement('Memory', memoryCheck);
        const gpuCheck = await checkGPU();
        updateRequirement('GPU', gpuCheck);
        const networkCheck = await checkNetwork();
        updateRequirement('Network', networkCheck);
      } catch (error) {
        console.error('System check failed:', error);
      }
    };

    checkSystem();
  }, []);

  const updateRequirement = (name: string, result: Partial<SystemRequirement>) => {
    setRequirements(prev => prev.map(req =>
      req.name === name ? { ...req, ...result } : req
    ));
  };

  const checkCPU = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      status: 'passed' as const,
      details: 'CPU compatible'
    };
  };

  const checkMemory = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      status: 'warning' as const,
      details: 'Memory requirements met'
    };
  };

  const checkGPU = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      status: 'passed' as const,
      details: 'GPU compatible'
    };
  };

  const checkNetwork = async () => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return {
      status: 'passed' as const,
      details: 'Network stable'
    };
  };

  const getStatusColor = (status: SystemRequirement['status']) => {
    switch (status) {
      case 'passed':
        return 'text-[#04c74f]';
      case 'failed':
        return 'text-[#f44336]';
      case 'warning':
        return 'text-[#ffc107]';
      default:
        return 'text-[#898CA9]';
    }
  };

  const getStatusBg = (status: SystemRequirement['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-[#04c74f]/20';
      case 'failed':
        return 'bg-[#f44336]/20';
      case 'warning':
        return 'bg-[#ffc107]/20';
      default:
        return 'bg-[#898CA9]/20';
    }
  };

  const getStatusIcon = (status: SystemRequirement['status']) => {
    switch (status) {
      case 'passed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {requirements.map((req) => (
        <div 
          key={req.name} 
          className="bg-[#1A1B23] rounded-xl p-4 flex items-start gap-3 group hover:bg-[#282A37] transition-colors cursor-pointer"
          title={req.details}
        >
          <div className={`mt-1 w-8 h-8 rounded-lg ${getStatusBg(req.status)} flex items-center justify-center ${getStatusColor(req.status)}`}>
            {getStatusIcon(req.status)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium text-white truncate">{req.name}</h3>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#898CA9]">{req.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SystemCheck;
