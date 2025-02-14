'use client';
import React, { ComponentType, useState } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import dynamic from 'next/dynamic';
import faIRPickers from '@/components/modules/date-pickers/persian-local-text';
import { IconBaseProps, IconType } from 'react-icons';
import IconWrapper from '@/shared/wrapper/icon-wrapper/IconWrapper';

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
  openButtonIcon?:IconType | ComponentType<IconBaseProps>
};

type DatePickerSimpleComponentProps = {
  options: DatePickerOptions;
};

const DatePickerSimpleComponent = ({ options }: DatePickerSimpleComponentProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get calendar type from Redux store
  const calenderType = useSelector((state: IRootState) => state.themeConfig.calenderType);

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    options.getValue(date);
  };

  // Determine locale text and format based on calendar type
  const getLocaleConfig = () => {
    if (calenderType === 'jalali') {
      return {
        localeText: faIRPickers,
        format: 'yyyy/MM/dd',
        dayOfWeekFormatter: faIRPickers.weekdayFormatter,
      };
    }
    return {};
  };

  const localeConfig = getLocaleConfig();
  const {openButtonIcon} = options

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
      }}
      slots={{
        openPickerIcon:options?.openButtonIcon
        ? (props) => <IconWrapper icon={options.openButtonIcon} {...props} />
          : undefined,

      }}
      {...localeConfig} // Spread locale-specific configurations
    />
  );
};

export default DatePickerSimpleComponent;




//       label={options?.label}
//       value={selectedDate}
//       onChange={handleDateChange}
//       localeText={calenderType === 'jalali' ? faIRPickers : {}}
//       openTo={options?.openModalDefault}
//       views={options.views}
//       dayOfWeekFormatter={calenderType === 'jalali' ? faIRPickers.weekdayFormatter : undefined}
//       disabled={options?.disabled}
//       readOnly={options?.readOnly}
//       disablePast={options?.disablePast}
//       slotProps={{
//         field: { clearable: options?.showClearable, onClear: () => setCleared(true) },
//       }}
//       format={calenderType === 'jalali' ? 'yyyy/MM/dd' : undefined}


// //TODO config all the props in calendar and separate the component date picker
