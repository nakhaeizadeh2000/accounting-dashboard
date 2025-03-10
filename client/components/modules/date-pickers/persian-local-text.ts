// const timeViews = {
//   hours: 'ساعت‌ها',
//   minutes: 'دقیقه‌ها',
//   seconds: 'ثانیه‌ها',
//   meridiem: 'بعد از ظهر',
// };

// const faIRPickers = {
//   // Calendar navigation
//   previousMonth: 'ماه گذشته',
//   nextMonth: 'ماه آینده',

//   // View navigation
//   openPreviousView: 'نمای قبلی',
//   openNextView: 'نمای بعدی',
//   calendarViewSwitchingButtonAriaLabel: (view) =>
//     view === 'year'
//       ? 'نمای سال باز است، رفتن به نمای تقویم'
//       : 'نمای تقویم باز است، رفتن به نمای سال',

//   // DateRange labels
//   start: 'شروع',
//   end: 'پایان',
//   startDate: 'تاریخ شروع',
//   startTime: 'ساعت شروع',
//   endDate: 'تاریخ پایان',
//   endTime: 'ساعت پایان',

//   // Action bar
//   cancelButtonLabel: 'لغو',
//   clearButtonLabel: 'پاک کردن',
//   okButtonLabel: 'اوکی',
//   todayButtonLabel: 'امروز',

//   // Toolbar titles
//   datePickerToolbarTitle: 'تاریخ را انتخاب کنید',
//   dateTimePickerToolbarTitle: 'تاریخ و ساعت را انتخاب کنید',
//   timePickerToolbarTitle: 'ساعت را انتخاب کنید',
//   dateRangePickerToolbarTitle: 'محدوده تاریخ را انتخاب کنید',

//   // Clock labels
//   clockLabelText: (view, formattedTime) =>
//     ` را انتخاب کنید ${timeViews[view]}. ${!formattedTime ? 'هیچ ساعتی انتخاب نشده است' : `ساعت انتخاب ${formattedTime} می باشد`}`,
//   hoursClockNumberText: (hours) => `${hours} ساعت‌ها`,
//   minutesClockNumberText: (minutes) => `${minutes} دقیقه‌ها`,
//   secondsClockNumberText: (seconds) => `${seconds} ثانیه‌ها`,

//   // Digital clock labels
//   selectViewText: (view) => ` را انتخاب کنید ${timeViews[view]}`,

//   // Calendar labels
//   calendarWeekNumberHeaderLabel: 'عدد هفته',
//   calendarWeekNumberHeaderText: '#',
//   calendarWeekNumberAriaLabelText: (weekNumber) => `هفته ${weekNumber}`,
//   calendarWeekNumberText: (weekNumber) => `${weekNumber}`,

//   // Open picker labels
//   openDatePickerDialogue: (formattedDate) =>
//     formattedDate
//       ? `تاریخ را انتخاب کنید، تاریخ انتخاب شده ${formattedDate} می‌باشد`
//       : 'تاریخ را انتخاب کنید',
//   openTimePickerDialogue: (formattedTime) =>
//     formattedTime
//       ? `ساعت را انتخاب کنید، ساعت انتخاب شده ${formattedTime} می‌باشد`
//       : 'ساعت را انتخاب کنید',
//   fieldClearLabel: 'پاک کردن مقدار',

//   // Table labels
//   timeTableLabel: 'انتخاب تاریخ',
//   dateTableLabel: 'انتخاب ساعت',

//   // Field section placeholders
//   fieldYearPlaceholder: (params) => 'Y'.repeat(params.digitAmount),
//   fieldMonthPlaceholder: (params) => (params.contentType === 'letter' ? 'MMMM' : 'MM'),
//   fieldDayPlaceholder: () => 'DD',
//   fieldWeekDayPlaceholder: (params) => (params.contentType === 'letter' ? 'EEEE' : 'EE'),
//   fieldHoursPlaceholder: () => 'hh',
//   fieldMinutesPlaceholder: () => 'mm',
//   fieldSecondsPlaceholder: () => 'ss',
//   fieldMeridiemPlaceholder: () => 'aa',

//   // View names
//   year: 'سال',
//   month: 'ماه',
//   day: 'روز',
//   weekDay: 'روز هفته',
//   hours: 'ساعت‌ها',
//   minutes: 'دقیقه‌ها',
//   seconds: 'ثانیه‌ها',
//   meridiem: 'نیم‌روز',

//   // Common
//   empty: 'خالی',
// };

// import { PickersLocaleText } from '@mui/x-date-pickers';

// const timeViews: Record<string, string> = {
//   hours: 'ساعت‌ها',
//   minutes: 'دقیقه‌ها',
//   seconds: 'ثانیه‌ها',
//   meridiem: 'بعد از ظهر',
// };

// const faIRPickers: Partial<PickersLocaleText<any>> & {
//   weekdayFormatter?: (date: Date) => string;
//   monthFormatter?: (monthIndex: number) => string;
// } = {
//   // Calendar navigation
//   previousMonth: 'ماه گذشته',
//   nextMonth: 'ماه آینده',

//   // View navigation
//   openPreviousView: 'نمای قبلی',
//   openNextView: 'نمای بعدی',
//   calendarViewSwitchingButtonAriaLabel: (view: string) =>
//     view === 'year'
//       ? 'نمای سال باز است، رفتن به نمای تقویم'
//       : 'نمای تقویم باز است، رفتن به نمای سال',

//   // DateRange labels
//   start: 'شروع',
//   end: 'پایان',
//   startDate: 'تاریخ شروع',
//   startTime: 'ساعت شروع',
//   endDate: 'تاریخ پایان',
//   endTime: 'ساعت پایان',

//   // Action bar
//   cancelButtonLabel: 'لغو',
//   clearButtonLabel: 'پاک کردن',
//   okButtonLabel: 'تایید',
//   todayButtonLabel: 'امروز',

//   // Toolbar titles
//   datePickerToolbarTitle: 'تاریخ را انتخاب کنید',
//   dateTimePickerToolbarTitle: 'تاریخ و ساعت را انتخاب کنید',
//   timePickerToolbarTitle: 'ساعت را انتخاب کنید',
//   dateRangePickerToolbarTitle: 'محدوده تاریخ را انتخاب کنید',

//   // Clock labels
//   clockLabelText: (view: string, formattedTime: string | null) =>
//     ` را انتخاب کنید ${timeViews[view]}. ${
//       !formattedTime ? 'هیچ ساعتی انتخاب نشده است' : `ساعت انتخاب ${formattedTime} می باشد`
//     }`,
//   hoursClockNumberText: (hours: string) => `${hours} ساعت‌ها`,
//   minutesClockNumberText: (minutes: string) => `${minutes} دقیقه‌ها`,
//   secondsClockNumberText: (seconds: string) => `${seconds} ثانیه‌ها`,

//   // Digital clock labels
//   selectViewText: (view: string) => ` را انتخاب کنید ${timeViews[view]}`,

//   // Calendar labels
//   calendarWeekNumberHeaderLabel: 'عدد هفته',
//   calendarWeekNumberHeaderText: '#',
//   calendarWeekNumberAriaLabelText: (weekNumber: number) => `هفته ${weekNumber}`,
//   calendarWeekNumberText: (weekNumber: number) => `${weekNumber}`,

//   // Open picker labels
//   openDatePickerDialogue: (formattedDate: string | null) =>
//     formattedDate
//       ? `تاریخ را انتخاب کنید، تاریخ انتخاب شده ${formattedDate} می‌باشد`
//       : 'تاریخ را انتخاب کنید',
//   openTimePickerDialogue: (formattedTime: string | null) =>
//     formattedTime
//       ? `ساعت را انتخاب کنید، ساعت انتخاب شده ${formattedTime} می‌باشد`
//       : 'ساعت را انتخاب کنید',
//   fieldClearLabel: 'پاک کردن مقدار',

//   // Table labels
//   timeTableLabel: 'انتخاب تاریخ',
//   dateTableLabel: 'انتخاب ساعت',

//   // Field section placeholders
//   fieldYearPlaceholder: (params: { digitAmount: number }) => 'Y'.repeat(params.digitAmount),
//   fieldMonthPlaceholder: (params: { contentType: string }) =>
//     params.contentType === 'letter' ? 'MMMM' : 'MM',
//   fieldDayPlaceholder: () => 'DD',
//   fieldWeekDayPlaceholder: (params: { contentType: string }) =>
//     params.contentType === 'letter' ? 'EEEE' : 'EE',
//   fieldHoursPlaceholder: () => 'hh',
//   fieldMinutesPlaceholder: () => 'mm',
//   fieldSecondsPlaceholder: () => 'ss',
//   fieldMeridiemPlaceholder: () => 'aa',

//   // View names
//   year: 'سال',
//   month: 'ماه',
//   day: 'روز',
//   weekDay: 'روز هفته',
//   hours: 'ساعت‌ها',
//   minutes: 'دقیقه‌ها',
//   seconds: 'ثانیه‌ها',
//   meridiem: 'نیم‌روز',

//   // Common
//   empty: 'خالی',

//   //formatter
//   weekdayFormatter: (date: Date) => {
//     const weekdays = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
//     const dayIndex = date.getDay();
//     return weekdays[dayIndex];
//   },

//   monthFormatter: (monthIndex: number) => {
//     const months = [
//       'فروردین',
//       'اردیبهشت',
//       'خرداد',
//       'تیر',
//       'مرداد',
//       'شهریور',
//       'مهر',
//       'آبان',
//       'آذر',
//       'دی',
//       'بهمن',
//       'اسفند',
//     ];
//     return months[monthIndex];
//   },
// };

// export default faIRPickers;
// // dayOfWeekFormatter={
// //             faIRPickers.weekdayFormatter && calType === 'jalali'
// //               ? faIRPickers.weekdayFormatter(day.getDay())
// //               : day.getDate().toString()
// //           }

// //TODO fix type for formatter week day

// components/modules/date-pickers/persian-local-text.ts
import { PickersLocaleText } from '@mui/x-date-pickers';

const timeViews: Record<string, string> = {
  hours: 'ساعت‌ها',
  minutes: 'دقیقه‌ها',
  seconds: 'ثانیه‌ها',
  meridiem: 'بعد از ظهر',
};

// Extend PickersLocaleText to include custom formatters
interface ExtendedPickersLocaleText<T> extends PickersLocaleText<T> {
  weekdayFormatter?: (date: Date) => string;
  monthFormatter?: (monthIndex: number) => string;
}

const faIRPickers: ExtendedPickersLocaleText<any> = {
  // ... (rest of your existing code)

  weekdayFormatter: (date: Date) => {
    const weekdays = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
    const dayIndex = date.getDay();
    return weekdays[dayIndex];
  },

  monthFormatter: (monthIndex: number) => {
    const months = [
      'فروردین',
      'اردیبهشت',
      'خرداد',
      'تیر',
      'مرداد',
      'شهریور',
      'مهر',
      'آبان',
      'آذر',
      'دی',
      'بهمن',
      'اسفند',
    ];
    return months[monthIndex];
  },
};

export default faIRPickers;
