'use client';

import styles from 'components/modules/upload-files/upload-file.module.scss';
import XIcon from './icons/XIcon';
import SingleFileUpload from '@/components/modules/upload-files/SingleFileUpload';

const MultiFileUpload = () => {
  return (
    <>
      {/* TODO: must handle all actions like SingleFileUpload component */}
      <div className="flex h-[20vh] w-full flex-row-reverse justify-between gap-2 rounded-xl bg-gray-200 p-2">
        <div className="flex h-full w-1/2 flex-col gap-2 overflow-hidden rounded-t-xl">
          <div className="flex h-5/6 w-full flex-row justify-between overflow-hidden rounded-xl bg-gray-50">
            {/* {TODO: File selection UI (same as SingleFileUpload component File selection UI but it does not show constraints in this place and their place is bellow i noted with another TODO task)} */}
            {/* TODO: consider this change in compare to SingleFileUpload component; when files are selected one, it must show a button under of drag and drop icon for starting upload and locking selecting files and after uploading of all selected files are finished, it unlocks to select more files and so on */}
          </div>
          <div className="flex h-1/6 w-full flex-row justify-end gap-2 overflow-hidden">
            {/* TODO: replace these four div with real Constraints like constraints in SingleFileUpload component selection UI section */}
            <div className="flex h-full w-16 rounded-md bg-gray-50"></div>
            <div className="flex h-full w-16 rounded-md bg-gray-50"></div>
            <div className="flex h-full w-16 rounded-md bg-gray-50"></div>
            <div className="flex h-full w-16 rounded-md bg-gray-50"></div>
          </div>
        </div>
        <div
          className={
            styles.scrollableDiv +
            ' flex h-full w-1/2 flex-row flex-wrap gap-2 overflow-y-scroll rounded-xl bg-gray-300 p-2 direction-ltr'
          }
        >
          <div className="relative -right-[3px] flex h-16 w-full flex-row gap-2 overflow-hidden rounded-xl bg-gray-50">
            {/* TODO: make filename and progress percent and file size dynamic like SingleFileUpload component */}
            <div className="flex w-3/5 flex-col justify-center px-4">
              {/* TODO: if name is bigger than its container must remove its external letters and place ... instead */}
              <p className="h-fit w-full text-gray-700">file-name.file-format</p>
              <div className="flex h-fit w-full flex-row items-center gap-2">
                <p className="flex text-blue-500">50%</p>
                <div className="flex h-3/5 w-[2px] rounded-xl bg-gray-300"></div>
                <p className="flex text-blue-500">uploading</p>
                <div className="flex h-3/5 w-[2px] rounded-xl bg-gray-300"></div>
                <p className="flex text-blue-500">8.77 MB</p>
              </div>
            </div>
            <div className="flex w-2/5 flex-row items-center gap-2 px-2">
              {/* TODO: must handle the progress to background of this div to change it from bg-gray-200 to bg-blue-500 while uploading progress grows */}
              {/* TODO: if uploding is cancelled vis XIcon button, must remove two blow div and instead appear remove form list and try again buttons in their place like SingleFileUpload component */}
              <div className="flex h-[.325rem] w-11/12 rounded-xl bg-gray-200"></div>
              <div className="flex w-1/12">
                <XIcon />
              </div>
            </div>
          </div>
          <div className="relative -right-[3px] flex h-16 w-full rounded-xl bg-gray-50"></div>
          <div className="relative -right-[3px] flex h-16 w-full rounded-xl bg-gray-50"></div>
        </div>
      </div>
    </>
  );
};

export default MultiFileUpload;
