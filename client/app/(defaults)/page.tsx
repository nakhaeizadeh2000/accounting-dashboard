'use client';

import dynamic from 'next/dynamic';
// import { Metadata } from 'next';
import { MdOutlineAlternateEmail } from 'react-icons/md';
// const EmailIcon = dynamic(
//   () => import('react-icons/md').then((mod) => mod.MdOutlineAlternateEmail),
//   { ssr: false },
// );
import UserSingleSelectWidget from './UserSingleSelectWidget';
// const UserSingleSelectWidget = dynamic(() => import('./UserSingleSelectWidget'));
import AnimatedInputElement from '@/components/modules/input-elements/AnimatedInputElement';
import { ItemType } from '@/components/modules/drop-downs/drop-down.type';
import { FileUpload } from '@/components/modules/upload-files/FileUpload';
import Image from 'next/image';
// const AnimatedInputElement = dynamic(
//   () => import('@/components/Elements/widgets/input-elements/AnimatedInputElement'),
// );

// export const metadata: Metadata = {
//   title: 'Sales Admin',
// };

const Sales = () => {
  const handleUserSelectedChange = (value: ItemType[]) => {
    // This function can be used for additional logic if needed
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    // TODO: work on these sections
    // formData.append()
  };

  return (
    <div>
      <p className="font-sans">This will use font-sans</p>
      <p className="font-yekan font-light">This will use YekanBakh Light</p>
      <p className="font-yekan font-normal">This will use YekanBakh Regular</p>
      <p className="font-yekan font-bold">
        This will use YekanBakh Bold <strong>this is testing</strong>
      </p>

      <form onSubmit={handleSubmit}>
        <div className="flex w-full justify-center gap-2">
          <UserSingleSelectWidget
            options={{
              containerClass: 'w-5/6 sm:w-5/6',
              onChange: handleUserSelectedChange,
              value: [],
            }}
          />
          {/* <AnimatedDropDown
            options={{
              label: 'menu',
              containerClass: 'w-4/5',
              items: [
                { value: 'item1', label: '1 Item 1' },
                { value: 'item2', label: '1 Item 2' },
                { value: 'item3', label: '1 Item 3' },
              ],
              onChange: handleDropdownChange,
            }}
          /> */}
          {/* <AnimatedInputElement
            options={{
              key: 'email',
              label: 'ایمیل',
              type: 'text',
              fieldError: [],
              // icon: { Icon: MdOutlineAlternateEmail },
            }}
          /> */}
        </div>
        <AnimatedInputElement
          options={{
            key: 'email',
            label: 'ایمیل',
            type: 'text',
            fieldError: [],
            // icon: { Icon: MdOutlineAlternateEmail },
          }}
        />
        <AnimatedInputElement
          options={{
            key: 'email',
            label: 'ایمیل',
            type: 'text',
            fieldError: [],
            // icon: { Icon: MdOutlineAlternateEmail },
          }}
        />
        <FileUpload />
        <button type="submit">Submit</button>
      </form>
      <Image
        src="http://localhost/api/files/test.jpg"
        width={500}
        height={500}
        alt="Picture of the author"
        unoptimized
      />
    </div>
  );
};

export default Sales;
