import React from 'react';

export const CreatorBadge: React.FC<{ name: string }> = ({ name }) => {
  return <span className="theme-badge">{name}</span>;
};
