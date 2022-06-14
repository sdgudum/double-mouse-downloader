import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  PropsWithChildren,
  PropsWithRef,
  HTMLAttributes,
} from 'react';
import styles from './index.module.less';

export interface TextBadgeProps
  extends PropsWithChildren,
    HTMLAttributes<HTMLSpanElement> {}

const TextBadge: React.FC<TextBadgeProps> = ({ children, style, ...attrs }) => {
  return (
    <span
      style={{
        borderRadius: '.2em',
        backgroundColor: '#5597ff',
        color: 'white',
        padding: '0 .2em',
        ...style,
      }}
      {...attrs}
    >
      {children}
    </span>
  );
};

export default TextBadge;
