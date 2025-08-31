import React from 'react';

interface CardProps {
  title: string;
  value?: string | number;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon, children, className }) => {
  return (
    <div className={`bg-white shadow rounded p-4 flex items-center ${className}`}>
      {icon && <div className="text-3xl text-gray-500 mr-4">{icon}</div>}
      <div>
        <h3 className="text-gray-700 font-semibold">{title}</h3>
        {value !== undefined && <p className="text-2xl font-bold text-gray-900">{value}</p>}
        {children}
      </div>
    </div>
  );
};

export default Card;
