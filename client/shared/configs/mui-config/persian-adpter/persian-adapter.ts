// lib/dateAdapters.ts
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AdapterDateFnsJalali } from '@date-io/date-fns-jalali';
import { Locale } from 'date-fns';

// Extend AdapterDateFns to make it compatible with TypeScript
class CustomAdapter extends AdapterDateFns {
  constructor({ locale, calendar }: { locale: Locale; calendar: 'gregorian' | 'jalali' }) {
    super({ locale });
    if (calendar === 'jalali') {
      return new AdapterDateFnsJalali({ locale });
    }
  }
}

export default CustomAdapter;
