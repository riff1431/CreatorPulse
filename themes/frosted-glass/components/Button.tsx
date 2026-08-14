import React from 'react';

export const ThemeButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  return <button {...props} className="theme-btn" />;
};
export default ThemeButton;
