import React from 'react';
import { Home } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl overflow-hidden mb-8">
      <div className="relative z-10 p-6">
        <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                <Home className="w-10 h-10 text-blue-600" />
              </div>
              <p className="text-sm">전문 가사도우미 서비스</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
