import React from 'react';
import {ArrowLeft} from 'lucide-react';

interface Props {
  title: string;
  onBack: () => void;
}

const ReservationHeader: React.FC<Props> = ({ title, onBack }) => (
  <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between p-4 border-b bg-white top-0 z-10">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">{title}</h1>
        <div className="w-10" />
      </div>
  </header>
);


export default ReservationHeader; 