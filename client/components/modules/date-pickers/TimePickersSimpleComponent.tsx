import dynamic from 'next/dynamic';
import { useState } from 'react';
import { format } from 'date-fns';
import { TextField } from '@mui/material';
import { renderTimeViewClock } from '@mui/x-date-pickers-pro';

const TimePicker = dynamic(() => import('@mui/x-date-pickers-pro').then((mod) => mod.TimePicker));

type Props = {
  options: {
    label: string;
    getValue?: (item: string) => void;
    disabled?: boolean;
    readOnly?: boolean;
    views?: Array<'hours' | 'minutes' | 'seconds'>;
    format?: string;
    openModalDefault?: 'hours' | 'minutes' | 'seconds';
  };
};

const TimePickersSimpleComponent = ({ options }: Props) => {
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [cleared, setCleared] = useState(false);

  const handleTimeChange = (newValue: Date | null) => {
    setSelectedTime(newValue);
    console.log('Selected Time (local):', newValue);
    if (newValue && options?.getValue) {
      const utcTime = format(newValue, "HH:mm:ss' UTC'");
      options.getValue(utcTime);
      console.log('Selected Time (UTC):', utcTime);
    }
  };
  return (
    <TimePicker
      label={options?.label}
      value={selectedTime}
      onChange={handleTimeChange}
      ampm={false} // Use 24-hour format
      // minTime={new Date(0, 0, 0, 9, 0)} // Earliest time allowed (09:00 AM)
      // maxTime={new Date(0, 0, 0, 18, 0)} // Latest time allowed (06:00 PM)
      // renderInput={(params: any) => <TextField {...params} fullWidth variant="outlined" />}
      slotProps={{
        field: {
          clearable: true,
          onClear: () => setCleared(true),
        },
      }}
      // viewRenderers={{
      //   hours: renderTimeViewClock,
      //   minutes: renderTimeViewClock,
      //   seconds: renderTimeViewClock,
      // }}
    />
  );
};

export default TimePickersSimpleComponent;
