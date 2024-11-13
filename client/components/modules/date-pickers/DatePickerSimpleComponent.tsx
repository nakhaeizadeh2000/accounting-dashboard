'use client';
import React, { useState } from 'react';
import faIRPickers from '@/components/modules/date-pickers/persian-local-text';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import dynamic from 'next/dynamic';

const DatePicker = dynamic(() => import('@mui/x-date-pickers-pro').then((mod) => mod.DatePicker));

type Props = {
  options: {
    getValue: (value: Date | null) => void;
    disabled?: boolean;
    readOnly?: boolean;
    disablePast?: boolean | undefined;
    showClearable?: boolean;
  };
};

const DatePickerSimpleComponent = ({ options }: Props) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [cleared, setCleared] = useState<boolean>(false);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    options?.getValue(date);
    console.log(date, 'date');
  };
  const calType = useSelector((state: IRootState) => state.themeConfig.calenderType);
  return (
    <DatePicker
      label="تاریخ"
      value={selectedDate}
      onChange={handleDateChange}
      localeText={calType === 'jalali' ? faIRPickers : {}}
      openTo="month"
      views={['year', 'month', 'day']}
      dayOfWeekFormatter={calType === 'jalali' ? faIRPickers.weekdayFormatter : undefined}
      disabled={options?.disabled}
      readOnly={options?.readOnly}
      disablePast={options?.disablePast}
      slotProps={{
        field: { clearable: options?.showClearable, onClear: () => setCleared(true) },
      }}
    />
  );
};

export default DatePickerSimpleComponent;
//TODO config all the props in calendar and separate the component date picker
//TODO when change the language the format of header is not change
//TODO fix dayofweekformatter in date picker
