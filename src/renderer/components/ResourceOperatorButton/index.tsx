import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';

const ResourceOperatorButton: React.FC<
  PropsWithChildren & ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, style = {}, disabled, ...attrs }) => {
  return (
    <button
      disabled={disabled}
      style={{
        border: 'none',
        background: 'none',
        fontSize: '.9em',
        cursor: 'pointer',
        ...style,
        color: disabled ? '#aaa' : style?.color,
      }}
      {...attrs}
    >
      {children}
    </button>
  );
};

export default ResourceOperatorButton;
