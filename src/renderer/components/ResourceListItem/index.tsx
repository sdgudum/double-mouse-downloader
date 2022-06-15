import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  PropsWithChildren,
  HTMLAttributes,
} from 'react';
import styles from './index.module.less';

export interface ResourceListItemProps
  extends PropsWithChildren,
    HTMLAttributes<HTMLLIElement> {}

const ResourceListItem: React.FC<ResourceListItemProps> = ({
  children,
  style,
  ...attrs
}) => {
  return (
    <li
      style={{
        background: 'white',
        borderRadius: '.2em',
        marginBottom: '.5em',
        overflow: 'hidden',
        ...style,
      }}
      {...attrs}
    >
      {children}
    </li>
  );
};

export default ResourceListItem;
