import React from 'react';

interface Props {
  title: string;
  onBack: () => void;
}

const ReservationHeader: React.FC<Props> = ({ title, onBack }) => (
  <header className="fixed top-0 left-0 right-0 h-14 bg-white flex items-center justify-between px-4 shadow z-20">
    <button onClick={onBack} className="p-2 text-gray-700 hover:text-orange-500">
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
    <h1 className="text-base font-semibold">{title}</h1>
    <div style={{ width: 40 }} />
  </header>
);

export default ReservationHeader; 