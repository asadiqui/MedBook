// components/shared/MobileComingSoon.tsx
import { Smartphone, Monitor } from 'lucide-react';

export default function MobileComingSoon() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      
      {/* Background decoration matching app spirit */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-md w-full bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
        <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
          <Smartphone className="w-8 h-8 text-primary-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mobile Experience <br/>
          <span className="text-primary-600">Coming Soon</span>
        </h1>
        
        <p className="text-gray-600 mb-8 mt-4 leading-relaxed">
          Our mobile application is currently under development. 
          MedBook is designed for desktop to provide the best healthcare management experience.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <Monitor className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm">Please use a Desktop</p>
              <p className="text-xs text-gray-500">For the full MedBook experience</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} MedBook. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
