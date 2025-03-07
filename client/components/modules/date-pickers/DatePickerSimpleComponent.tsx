'use client';
import React, { ComponentType, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import dynamic from 'next/dynamic';
import faIRPickers from '@/components/modules/date-pickers/persian-local-text';
import { IconBaseProps, IconType } from 'react-icons';
import IconWrapper from '@/shared/wrapper/icon-wrapper/IconWrapper';
import { TextField, TextFieldProps } from '@mui/material';
import { faIR } from 'date-fns-jalali/locale';

// Dynamically import DatePicker to reduce initial bundle size
const DatePicker = dynamic(() => import('@mui/x-date-pickers-pro').then((mod) => mod.DatePicker));

type DatePickerOptions = {
  label: string;
  getValue: (value: Date | null) => void;
  disabled?: boolean;
  readOnly?: boolean;
  disablePast?: boolean;
  showClearable?: boolean;
  views?: Array<'year' | 'month' | 'day'>;
  openModalDefault?: 'day' | 'month' | 'year';
  openButtonIcon?: IconType | ComponentType<IconBaseProps>;
};

type DatePickerSimpleComponentProps = {
  options: DatePickerOptions;
};

const DatePickerSimpleComponent = ({ options }: DatePickerSimpleComponentProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get calendar type from Redux store
  const calenderType = useSelector((state: IRootState) => state.themeConfig.calenderType);

  useEffect(() => {
    options.getValue(selectedDate);
  }, [selectedDate, options]);

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    options.getValue(date);
  };

  // Determine locale text and format based on calendar type
  const localeConfig = useMemo(() => {
    if (calenderType === 'jalali') {
      return {
        adapterLocale: faIR,
        localeText: faIRPickers,
        format: 'yyyy/MM/dd',
        dayOfWeekFormatter: faIRPickers.weekdayFormatter,
      };
    }
    return {
      adapterLocale: undefined, // Default to browser locale
      localeText: undefined,
      format: 'MM/dd/yyyy', // Default Gregorian format
      dayOfWeekFormatter: undefined,
    };
  }, [calenderType]);

  return (
    <DatePicker
      label={options.label}
      value={selectedDate}
      onChange={handleDateChange}
      openTo={options.openModalDefault}
      views={options.views}
      disabled={options.disabled}
      readOnly={options.readOnly}
      disablePast={options.disablePast}
      slotProps={{
        field: { clearable: options.showClearable, onClear: () => setSelectedDate(null) },
        actionBar: {
          actions: ['clear', 'today'],
        },
      }}
      slots={{
        openPickerIcon: options?.openButtonIcon
          ? (props) => <IconWrapper icon={options.openButtonIcon} {...props} />
          : undefined,
        yearPicker: (props) => {
          const jalaliYear = getJalaliYear(props.date);
          return <div>{jalaliYear}</div>; // Customize rendering here
        },
      }}
      {...localeConfig} // Spread locale-specific configurations
    />
  );
};

export default DatePickerSimpleComponent;

// //TODO config all the props in calendar and separate the component date picker
