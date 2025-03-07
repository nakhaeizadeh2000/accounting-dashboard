// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { faIR } from 'date-fns-jalali/locale';
import { format, parse } from 'date-fns-jalali';

class PersianAdapter extends AdapterDateFns {
  constructor({ locale = faIR } = {}) {
    super({ locale });
  }

  format = (date: Date, formatString: string): string => {
    return format(date, formatString, { locale: this.locale });
  };

  parse = (value: string, formatString: string): Date | null => {
    if (!value) return null;
    return parse(value, formatString, new Date(), { locale: this.locale });
  };
}
