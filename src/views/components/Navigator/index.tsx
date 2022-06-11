import React, { PropsWithChildren } from 'react';

export type NavigatorProps = PropsWithChildren;

const Navigator: React.FC<NavigatorProps> = ({ children }) => {
  return <nav>{children}</nav>;
};

export default Navigator;
