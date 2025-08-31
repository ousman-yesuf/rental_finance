import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  let baseClass = "px-4 py-2 rounded font-medium focus:outline-none transition";

  switch (variant) {
    case 'primary':
      baseClass += " bg-blue-500 text-white hover:bg-blue-600";
      break;
    case 'secondary':
      baseClass += " bg-gray-300 text-gray-800 hover:bg-gray-400";
      break;
    case 'danger':
      baseClass += " bg-red-500 text-white hover:bg-red-600";
      break;
  }

  return (
    <button className={baseClass} {...props}>
      {children}
    </button>
  );
};

export default Button;
