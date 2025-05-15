import React from 'react';
import { FileConstraintsProps } from '../../utils/file-types';
import styles from '../../styles/upload-file.module.scss';

/**
 * Displays the file constraints (file types and size limits)
 */
const FileConstraints: React.FC<FileConstraintsProps> = ({ displayConstraints }) => {
  return (
    <div
      className={`${styles.scrollableDiv} flex h-1/5 w-full flex-row-reverse flex-wrap items-center justify-center gap-1 overflow-y-auto overflow-x-hidden sm:gap-2`}
    >
      {displayConstraints.map((constraint, index) => (
        <div
          key={index}
          className="flex h-fit w-fit items-center justify-center rounded-md bg-slate-200 px-1 py-1 text-xs text-neutral-500 dark:bg-slate-700 dark:text-neutral-300 sm:px-2 sm:text-sm"
        >
          <p dir="ltr" className="text-neutral-500 dark:text-neutral-400">
            {constraint}
          </p>
        </div>
      ))}
    </div>
  );
};

export default FileConstraints;
