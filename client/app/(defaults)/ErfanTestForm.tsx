'use client';

import DatePickerSimpleComponent from '@/components/modules/date-pickers/DatePickerSimpleComponent';
import TimePickersSimpleComponent from '@/components/modules/date-pickers/TimePickersSimpleComponent';
import { TextField } from '@mui/material';
import { StaticDatePicker } from '@mui/x-date-pickers-pro';
import { PiAirplaneTakeoffDuotone } from 'react-icons/pi';

const ErfanTestForm = () => {
  const setDate = (date: Date | null) => {
    if (date) {
      const localDate = new Date(date);
      const utcDate = localDate.toISOString();
      console.log(utcDate, 'parent');
    }
  };

  const setTime = (time: string) => {
    if (time) {
      console.log(time, 'parent time');
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
      <DatePickerSimpleComponent
        options={{
          label: 'تاریخ',
          getValue: (date) => console.log('Selected Date:', date),
          views: ['year', 'month', 'day'],
          openModalDefault: 'day',
          showClearable: true,
          disablePast: true,
          openButtonIcon: PiAirplaneTakeoffDuotone,
        }}
      />
      <TextField id="outlined-basic" label="ایمیل" variant="outlined" size="small" />
      <StaticDatePicker orientation="landscape" dayOfWeekFormatter={persianDayFormatter} />
    </div>
  );
};

export default ErfanTestForm;
