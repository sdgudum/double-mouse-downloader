import React, { AnchorHTMLAttributes } from 'react';

const OuterLink: React.FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  href,
  children,
  ...props
}) => {
  const onClick: React.MouseEventHandler<HTMLAnchorElement> = (ev) => {
    ev.preventDefault();

    if (!href) return;

    jsBridge.openInBrowser.open(href);
  };

  return (
    <a onClick={onClick} href={href} rel="noreferrer" {...props}>
      {children}
    </a>
  );
};

export default OuterLink;
