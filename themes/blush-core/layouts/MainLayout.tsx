import React from 'react';

export const ThemeMainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="theme-layout-wrapper">{children}</div>;
};
export default ThemeMainLayout;
