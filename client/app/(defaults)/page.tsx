'use client';

import AnimatedDropDown from '@/components/Elements/drop-downs/AnimatedDropDown';
import { Metadata } from 'next';

// export const metadata: Metadata = {
//   title: 'Sales Admin',
// };

const Sales = () => {
  const handleDropdownChange = (value: any) => {
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
        <div className="flex gap-2">
          <AnimatedDropDown
            options={{
              label: 'menu',
              navClass: 'w-1/5 w',
              items: [
                { value: 'item1', label: '1 Item 1' },
                { value: 'item2', label: '1 Item 2' },
                { value: 'item3', label: '1 Item 3' },
              ],
              onChange: handleDropdownChange,
            }}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Sales;
