// persian-local-text.ts
const faIRPickers = {
  // Month names
  monthsShort: [
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
  ],
  months: [
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
  ],

  // Weekday names
  weekdays: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
  weekdaysShort: ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],

  // Other translations
  today: 'امروز',
  cancel: 'انصراف',
  clear: 'پاک کردن',
  ok: 'تایید',

  // Weekday formatter
  weekdayFormatter: (day: number) => ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'][day],
};

export default faIRPickers;
