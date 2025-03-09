// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
// // import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { faIR } from 'date-fns-jalali/locale';
// import { Locale, format as formatFn } from 'date-fns';
// import { format, parse, startOfToday, toDate, getYear as getJalaliYear } from 'date-fns-jalali';
// const persianLocale: Locale = {
//   ...faIR,
//   formatLong: {
//     date: (args) => formatFn(new Date(), 'PP', { locale: faIR }), // Example implementation
//     time: (args) => formatFn(new Date(), 'p', { locale: faIR }),
//     dateTime: (args) => formatFn(new Date(), 'PPp', { locale: faIR }),
//   },
//   // localize: localize, // Use date-fns's localize function
// };

// export class PersianAdapter extends AdapterDateFns {
//   constructor({ locale = persianLocale } = {}) {
//     super({ locale });
//     console.log(this.getYear(new Date()));
//   }

//   format = (date: Date, formatString: string): string => {
//     return format(date, formatString, { locale: this.locale });
//   };

//   parse = (value: string, formatString: string): Date | null => {
//     if (!value) return null;
//     return parse(value, formatString, new Date(), { locale: this.locale });
//   };

//   // Override getYear to return Jalali year
//   getYear = (date: Date): number => {
//     return getJalaliYear(date);
//   };

//   // Override setYear to handle Jalali year input
//   setYear = (date: Date, year: number): Date => {
//     const currentJalaliYear = getJalaliYear(date);
//     const diff = year - currentJalaliYear;
//     return toDate(new Date(date.getFullYear() + diff, date.getMonth(), date.getDate()));
//   };
// }

// persian-adapter.ts
import { AdapterDateFnsJalali } from '@mui/x-date-pickers/AdapterDateFnsJalali';
import { format as formatJalali, getYear, getMonth, getDate } from 'date-fns-jalali';

export class PersianAdapter extends AdapterDateFnsJalali {
  // Override getYearRange to ensure it works with Persian years
  getYearRange([start, end]: [Date, Date]) {
    const startYear = getYear(start);
    const endYear = getYear(end);

    const years = [];
    for (let year = startYear; year <= endYear; year += 1) {
      years.push(year);
    }

    return years;
  }

  // Override format to ensure proper Persian date formatting
  formatByString(date: Date, formatString: string) {
    return formatJalali(date, formatString);
  }

  // Ensure correct year display
  getFormatHelperText(formatString: string) {
    return super.getFormatHelperText(formatString).replace('yyyy', 'سال');
  }

  // Override to ensure proper Persian month names
  getMonthName(month: number, variant: 'long' | 'short' = 'long') {
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

    return months[month];
  }

  // Override to ensure day of week is correctly displayed
  getDayOfWeek(date: Date) {
    const dayOfWeek = super.getDayOfWeek(date);
    // In Persian calendar, the week starts on Saturday (0) not Sunday
    return (dayOfWeek + 1) % 7;
  }
}
