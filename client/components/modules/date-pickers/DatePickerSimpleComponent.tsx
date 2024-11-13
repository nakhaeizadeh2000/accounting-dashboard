'use client';
import React, { useState } from 'react';
import { DatePicker, DateViewRendererProps, PickerValidDate } from '@mui/x-date-pickers-pro';
import faIRPickers from '@/components/modules/date-pickers/persian-local-text';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { Button, Grid2 } from '@mui/material';

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
  // console.log(options:{})
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    options?.getValue(date);
    console.log(date, 'date');
  };
  const calType = useSelector((state: IRootState) => state.themeConfig.calenderType);
  // const customMonthRenderer = ({ value, onChange }: DateViewRendererProps<Date, 'month'>) => {
  //   const months = [
  //     'Jan',
  //     'Febbbb',
  //     'Mar',
  //     'Apr',
  //     'May',
  //     'Jun',
  //     'Jul',
  //     'Aug',
  //     'Sep',
  //     'Oct',
  //     'Nov',
  //     'Dec',
  //   ];

  //   const handleMonthChange = (monthIndex: number) => {
  //     if (onChange) {
  //       const newDate = new Date(value?.getFullYear() ?? 0, monthIndex);
  //       onChange(newDate, 'finish', 'month');
  //     }
  //   };

  //   return (
  //     <Grid2 container spacing={1}>
  //       {months.map((monthName, index) => (
  //         <Grid2 component="div" key={monthName}>
  //           <Button
  //             fullWidth
  //             variant={value?.getMonth() === index ? 'contained' : 'outlined'}
  //             onClick={() => handleMonthChange(index)}
  //           >
  //             {monthName}
  //           </Button>
  //         </Grid2>
  //       ))}
  //     </Grid2>
  //   );
  // };
  return (
    <DatePicker
      label="تاریخ"
      value={selectedDate}
      onChange={handleDateChange}
      localeText={calType === 'jalali' ? faIRPickers : {}}
      openTo="month"
      views={['year', 'month', 'day']}
      onMonthChange={(month) => {
        const dateObject = new Date(month)?.toISOString();

        console.log(dateObject);
        // if (faIRPickers.monthFormatter) console.log(month.getUTCMonth());
        // console.log(faIRPickers.monthFormatter(month.getMonth()));
      }}
      viewRenderers={
        {
          // month: customMonthRenderer,
        }
      }
      // slots={{
      //   monthButton:{<Button></Button>}
      // }}
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
