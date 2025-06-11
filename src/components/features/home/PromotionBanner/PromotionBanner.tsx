import React from 'react';

interface PromotionBannerProps {
  title: string;
  subtitle: string;
  discount: string;
  onClick?: () => void;
}

export const PromotionBanner: React.FC<PromotionBannerProps> = ({
  title,
  subtitle,
  discount,
  onClick,
}) => {
  return (
    <section className="mb-8">
      <button
        onClick={onClick}
        className="w-full bg-white rounded-2xl p-6 border border-gray-200 relative overflow-hidden hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
          <div className="bg-orange-100 px-4 py-2 rounded-xl">
            <span className="text-2xl font-bold text-orange-500">
              {discount}
            </span>
          </div>
        </div>
      </button>
    </section>
  );
};
