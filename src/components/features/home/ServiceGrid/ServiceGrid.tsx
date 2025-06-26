import React from 'react';
import { Home, Wind, Plus, User } from 'lucide-react';
import { SERVICE_TYPES } from '@/constants';

interface ServiceGridProps {
  onServiceClick: (serviceType: string) => void;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({ onServiceClick }) => {
  const services = [
    {
      id: SERVICE_TYPES.GENERAL_CLEANING,
      icon: Home,
      label: '가사',
      color: 'text-orange-500',
    },
    {
      id: 'aircon',
      icon: Wind,
      label: '에어컨',
      color: 'text-orange-500',
    },
    {
      id: 'cleaning',
      icon: Plus,
      label: '청소',
      color: 'text-orange-500',
    },
    {
      id: SERVICE_TYPES.PET_CARE,
      icon: User,
      label: '돌봄',
      color: 'text-orange-500',
    },
  ];

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4 pl-">서비스</h2>
      <div className="grid grid-cols-4 gap-4">
        {services.map(({ id, icon: Icon, label, color }) => (
          <button
            key={id}
            onClick={() => onServiceClick(id)}
            className="flex flex-col items-center group"
          >
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-orange-200 transition-colors">
              {label === '청소' ? (
                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
              ) : (
                <Icon className={`w-8 h-8 ${color}`} />
              )}
            </div>
            <span className="text-sm text-gray-700 font-medium">{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
