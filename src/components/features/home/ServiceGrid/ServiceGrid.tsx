import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface ServiceGridProps {
  onServiceClick: () => void;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({ onServiceClick }) => {
  return (
    <section className="mb-8">
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="text-center">
          <div className="w-20 h-20 bg-orange-200 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Sparkles className="w-10 h-10 text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            전문 가사도우미 서비스
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            청소, 가사, 돌봄 등 다양한 서비스를
            <br />
            믿을 수 있는 전문가와 함께하세요
          </p>
          <button
            onClick={onServiceClick}
            className="w-full bg-orange-400 text-white font-semibold py-4 px-6 rounded-xl hover:bg-orange-500 transition-all duration-200 flex items-center justify-center gap-2"
          >
            서비스 시작하기
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
