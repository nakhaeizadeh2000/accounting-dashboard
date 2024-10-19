'use client';

import AnimatedInputElement from '@/components/Elements/input-elements/AnimatedInputElement';
import { Metadata } from 'next';
import { MdOutlineAlternateEmail } from 'react-icons/md';
import UserSingleSelectWidget from './UserSingleSelectWidget';

// export const metadata: Metadata = {
//   title: 'Sales Admin',
// };

const Sales = () => {
  const handleUserSingleSelectChange = (value: any) => {
    // This function can be used for additional logic if needed
    // console.log('Selected Value:', value);
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
        <div className="flex w-full gap-2">
          <UserSingleSelectWidget
            options={{
              containerClass: 'w-1/5',
              onChange: handleUserSingleSelectChange,
              isMarquee: true,
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
          <AnimatedInputElement
            options={{
              key: 'email',
              label: 'ایمیل',
              type: 'text',
              fieldError: [],
              icon: { Icon: MdOutlineAlternateEmail },
            }}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Sales;
