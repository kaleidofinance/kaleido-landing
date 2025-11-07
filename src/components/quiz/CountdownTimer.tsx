'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
    targetDate: string | Date;
    onComplete?: () => void;
}

export function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        function calculateTimeLeft() {
            const target = new Date(targetDate);
            const now = new Date();
            const difference = target.getTime() - now.getTime();

            if (difference <= 0) {
                onComplete?.();
                return { hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                hours: Math.floor(difference / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000)
            };
        }

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        // Update every second
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            if (newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate, onComplete]);

    return (
        <div className="inline-flex items-center justify-center px-4 py-2 space-x-2 bg-white/5 rounded-lg">
            <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-xs text-gray-400">h</span>
            </div>
            <span className="text-gray-500">:</span>
            <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-xs text-gray-400">m</span>
            </div>
            <span className="text-gray-500">:</span>
            <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-white">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-xs text-gray-400">s</span>
            </div>
        </div>
    );
}
