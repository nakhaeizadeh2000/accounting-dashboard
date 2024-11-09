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
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DatePicker, PickerValidDate } from '@mui/x-date-pickers-pro';
import { useState } from 'react';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { FileUpload } from '@/components/modules/upload-files/FileUpload';
// const AnimatedInputElement = dynamic(
//   () => import('@/components/Elements/widgets/input-elements/AnimatedInputElement'),
// );

// export const metadata: Metadata = {
//   title: 'Sales Admin',
// };

const Sales = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [cleared, setCleared] = useState<boolean>(false);
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    console.log(date, 'date');
  };

  const handleUserSelectedChange = (value: ItemType[]) => {
    // This function can be used for additional logic if needed
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    // TODO: work on these sections
    // formData.append()
  };

  const persianDayFormatter = (date: Date) => {
    const persianDays = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
    const dayIndex = date.getDay();
    return persianDays[dayIndex];
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
        <AnimatedInputElement
          options={{
            key: 'email',
            label: 'ایمیل',
            type: 'text',
            fieldError: [],
            // icon: { Icon: MdOutlineAlternateEmail },
          }}
        />
        <DatePicker
          label="تاریخ"
          value={selectedDate}
          onChange={handleDateChange}
          // openTo='' this config for when client click on date calender
          dayOfWeekFormatter={persianDayFormatter}
          disabled={false}
          readOnly={false}
          disablePast={true}
          slotProps={{
            field: { clearable: false, onClear: () => setCleared(true) },
          }}
        />
        <StaticDatePicker orientation="landscape" dayOfWeekFormatter={persianDayFormatter} />
        <FileUpload />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Sales;

//TODO config all the props in calendar and separate the component date picker
