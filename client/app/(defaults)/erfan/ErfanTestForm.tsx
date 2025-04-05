'use client';

import DatePickerSimpleComponent from '@/components/modules/date-pickers/DatePickerSimpleComponent';
import TimePickersSimpleComponent from '@/components/modules/date-pickers/TimePickersSimpleComponent';
import Editor from '@/components/modules/editor/TinyMceComponent';
import { IconButton, styled, TextField } from '@mui/material';
import { StaticDatePicker } from '@mui/x-date-pickers-pro';
import { BsMailbox } from 'react-icons/bs';
import { PiAirplaneTakeoffDuotone } from 'react-icons/pi';
import Badge, { BadgeProps } from '@mui/material/Badge';

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
      <br />
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
      <br />
      <TextField id="outlined-basic" label="ایمیل" variant="outlined" size="small" />
      <br />
      <StaticDatePicker orientation="landscape" dayOfWeekFormatter={persianDayFormatter} />
      <br />
      <Editor onChange={(data) => console.log(data)} />
      <br />
      <span className="text-lg">Badge</span>

      <div>
        <Badge
          badgeContent={
            3
            // <span className="absolute top-0 flex h-3 w-3 ltr:right-0 rtl:left-0">
            //   <span className="absolute -top-[3px] inline-flex h-full w-full animate-ping rounded-full bg-success/50 opacity-75 ltr:-left-[3px] rtl:-right-[3px]"></span>
            //   <span className="relative inline-flex h-[6px] w-[6px] rounded-full bg-success">
            //     {3}
            //   </span>
            // </span>
          }
          color="secondary"
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          aria-label="label"
          className="costume-badge"
          overlap="circular"
        >
          <BsMailbox
            style={{ width: '24px', height: '24px', cursor: 'pointer' }}
            onClick={() => console.log('ehh')}
          />
        </Badge>
      </div>
    </div>
  );
};

export default ErfanTestForm;
