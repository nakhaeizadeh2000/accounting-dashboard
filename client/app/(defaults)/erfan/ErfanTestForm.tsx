'use client';

import DatePickerSimpleComponent from '@/components/modules/date-pickers/DatePickerSimpleComponent';
import TimePickersSimpleComponent from '@/components/modules/date-pickers/TimePickersSimpleComponent';
import Editor from '@/components/modules/editor/TinyMceComponent';
import { IconButton, styled, TextField } from '@mui/material';
import { StaticDatePicker } from '@mui/x-date-pickers-pro';
import { BsMailbox } from 'react-icons/bs';
import { PiAirplaneTakeoffDuotone } from 'react-icons/pi';
import Badge, { BadgeProps } from '@mui/material/Badge';
import AdvancedBadgeExample from '@/components/modules/badge-new/examples/AdvancedBadgeExample';
import SimpleBadgeExample from '@/components/modules/badge-new/examples/SimpleBadgeExample';
import AnimatedBadge from '@/components/modules/badge-new/components/AnimatedBadge';
import AnimatedBadgeExample from '@/components/modules/badge-new/examples/AnimatedBadgeExample';

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: '2px solid',
    padding: '0 4px',
  },
}));

const ErfanTestForm = () => {
  const setDate = (date: Date | null) => {
    if (date) {
      const localDate = new Date(date);
      const utcDate = localDate.toISOString();
      // console.log(utcDate, 'parent');
    }
  };

  const setTime = (time: string) => {
    if (time) {
      // console.log(time, 'parent time');
    }
  };

  const persianDayFormatter = (date: Date) => {
    const persianDays = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
    const dayIndex = date.getDay();
    return persianDays[dayIndex];
  };

  return (
    <div className="m-2 mt-3 flex w-full flex-col justify-center gap-2">
      <TimePickersSimpleComponent
        options={{ label: 'ساعت', getValue: setTime, formatTime: 'HH:mm' }}
      />
      <hr className="m-4" />
      <DatePickerSimpleComponent
        options={{
          label: 'تاریخ',
          getValue: setDate,
          views: ['year', 'month', 'day'],
          openModalDefault: 'day',
          showClearable: true,
          disablePast: true,
          openButtonIcon: PiAirplaneTakeoffDuotone,
        }}
      />
      <hr className="m-4" />
      <TextField id="outlined-basic" label="ایمیل" variant="outlined" size="small" />
      <hr className="m-4" />
      <StaticDatePicker orientation="landscape" dayOfWeekFormatter={persianDayFormatter} />
      <hr className="m-4" />
      <Editor onChange={(data) => console.log(data)} />
      <hr className="m-4" />
      <span className="text-lg">Badge</span>
      <AdvancedBadgeExample />
      <SimpleBadgeExample />
      <AnimatedBadgeExample />
      <hr className="m-4" />
      <span className="text-lg">CheckBox</span>
    </div>
  );
};

export default ErfanTestForm;
