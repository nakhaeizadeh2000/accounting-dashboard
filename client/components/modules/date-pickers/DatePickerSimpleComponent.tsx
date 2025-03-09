'use client';
import React, { ComponentType, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import dynamic from 'next/dynamic';
import faIRPickers from '@/components/modules/date-pickers/persian-local-text';
import { IconBaseProps, IconType } from 'react-icons';
import IconWrapper from '@/shared/wrapper/icon-wrapper/IconWrapper';
import { format, startOfToday } from 'date-fns-jalali';

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => startOfToday());

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

  // Determine locale text based on calendar type
  const localeText = useMemo(() => {
    return calenderType === 'jalali' ? faIRPickers : undefined;
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
      localeText={localeText}
      format={calenderType === 'jalali' ? 'yyyy/MM/dd' : 'MM/dd/yyyy'}
      slotProps={{
        field: {
          clearable: options.showClearable,
          onClear: () => setSelectedDate(null),
        },
        actionBar: {
          actions: ['clear', 'today'],
        },
        textField: {
          InputProps: {
            // Right-to-left support for Persian
            dir: calenderType === 'jalali' ? 'rtl' : 'ltr',
          },
        },
      }}
      slots={{
        openPickerIcon: options?.openButtonIcon
          ? (props) => <IconWrapper icon={options.openButtonIcon} {...props} />
          : undefined,
      }}
    />
  );
};

export default DatePickerSimpleComponent;
