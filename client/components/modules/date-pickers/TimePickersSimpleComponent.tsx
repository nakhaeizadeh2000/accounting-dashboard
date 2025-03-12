import dynamic from 'next/dynamic';
import { useState } from 'react';
import { format } from 'date-fns';
import { TextField } from '@mui/material';
import { renderTimeViewClock } from '@mui/x-date-pickers-pro';
import { BsAlarmFill } from 'react-icons/bs';
import faIRPickers from './persian-local-text';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

const TimePicker = dynamic(() => import('@mui/x-date-pickers-pro').then((mod) => mod.TimePicker));

type TimePickerOptions = {
  label: string;
  getValue?: (item: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  views?: Array<'hours' | 'minutes' | 'seconds'>;
  format?: string;
  openModalDefault?: 'hours' | 'minutes' | 'seconds';
  formatTime?: string;
};

type TimePickerSimpleComponentProps = {
  options: TimePickerOptions;
};

const TimePickersSimpleComponent = ({ options }: TimePickerSimpleComponentProps) => {
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
  const callenderType = useSelector((state: IRootState) => state.themeConfig.calenderType);
  return (
    <TimePicker
      className="min-h-[auto] leading-[1.6]"
      label={options?.label}
      value={selectedTime}
      localeText={callenderType === 'jalali' ? faIRPickers : {}}
      onChange={handleTimeChange}
      ampm={false} // Use 24-hour format
      slots={{
        // OpenPickerIcon: AlarmIcon,
        openPickerIcon: BsAlarmFill,
      }}
      slotProps={{
        field: {
          clearable: true,
          onClear: () => setCleared(true),
        },
      }}
      viewRenderers={{
        hours: renderTimeViewClock,
        minutes: renderTimeViewClock,
        seconds: renderTimeViewClock,
      }}
      format={options?.formatTime}
    />
  );
};

export default TimePickersSimpleComponent;
