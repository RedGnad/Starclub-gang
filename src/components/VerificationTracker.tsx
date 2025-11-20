import React from 'react';

interface VerificationInfo {
  id: string;
  dappName: string;
  startTime: number;
  attempt: number;
  maxAttempts: number;
}

interface VerificationTrackerProps {
  verifications: VerificationInfo[];
}

export function VerificationTracker({ verifications }: VerificationTrackerProps) {
  if (verifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[9997] max-w-xs">
      <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-xl">
        <div className="text-white text-xs font-bold mb-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          Verifications ({verifications.length})
        </div>
        
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {verifications.map((verif) => {
            const elapsed = Math.floor((Date.now() - verif.startTime) / 1000);
            const progress = (verif.attempt / verif.maxAttempts) * 100;
            
            return (
              <div key={verif.id} className="bg-white/5 rounded p-2 border border-white/10">
                <div className="text-white text-xs font-medium truncate">
                  {verif.dappName}
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-white/10 rounded-full h-1">
                    <div 
                      className="bg-blue-400 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-white/60 text-xs">
                    {verif.attempt}/{verif.maxAttempts}
                  </div>
                </div>
                
                <div className="text-white/40 text-xs mt-1">
                  {elapsed}s
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
