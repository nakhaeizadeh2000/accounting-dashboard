import { Metadata } from 'next';

import TestForm from './TestForm';
import ErfanTestForm from './ErfanTestForm';
import styles from 'components/modules/upload-files/upload-file.module.scss';

export const metadata: Metadata = {
  title: 'SalsetDatees Admin',
};

const Sales = () => {
  return (
    <>
      <div className="flex h-[20vh] w-full flex-row-reverse justify-between gap-2 rounded-xl bg-gray-200 p-2">
        <div className="flex h-full w-1/2 flex-col gap-2 overflow-hidden rounded-t-xl">
          <div className="flex h-5/6 w-full flex-row justify-between overflow-hidden rounded-xl bg-gray-50"></div>
          <div className="flex h-1/6 w-full flex-row justify-end gap-2 overflow-hidden">
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
          <div className="relative -right-[3px] flex h-16 w-full rounded-xl bg-gray-50"></div>
          <div className="relative -right-[3px] flex h-16 w-full rounded-xl bg-gray-50"></div>
          <div className="relative -right-[3px] flex h-16 w-full rounded-xl bg-gray-50"></div>
        </div>
      </div>
    </>
  );
};

export default Sales;
