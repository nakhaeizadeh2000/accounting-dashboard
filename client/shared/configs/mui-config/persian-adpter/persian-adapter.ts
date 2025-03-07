import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { faIR } from 'date-fns-jalali/locale';
import { Locale, format as formatFn } from 'date-fns';
import { format, parse, startOfToday, toDate, getYear as getJalaliYear } from 'date-fns-jalali';
const persianLocale: Locale = {
  ...faIR,
  formatLong: {
    date: (args) => formatFn(new Date(), 'PP', { locale: faIR }), // Example implementation
    time: (args) => formatFn(new Date(), 'p', { locale: faIR }),
    dateTime: (args) => formatFn(new Date(), 'PPp', { locale: faIR }),
  },
  // localize: localize, // Use date-fns's localize function
};

export class PersianAdapter extends AdapterDateFns {
  constructor({ locale = persianLocale } = {}) {
    super({ locale });
  }

  format = (date: Date, formatString: string): string => {
    return format(date, formatString, { locale: this.locale });
  };

  parse = (value: string, formatString: string): Date | null => {
    if (!value) return null;
    return parse(value, formatString, new Date(), { locale: this.locale });
  };

  // Override getYear to return Jalali year
  getYear = (date: Date): number => {
    return getJalaliYear(date);
  };

  // Override setYear to handle Jalali year input
  setYear = (date: Date, year: number): Date => {
    const currentJalaliYear = getJalaliYear(date);
    const diff = year - currentJalaliYear;
    return toDate(new Date(date.getFullYear() + diff, date.getMonth(), date.getDate()));
  };
}
