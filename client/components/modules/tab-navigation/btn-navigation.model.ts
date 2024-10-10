import { Route } from 'next';
import { IconType } from 'react-icons';

export interface btnNavigation {
  label: string;
  Icon: IconType;
  link: Route<string>; // just route , don't url because this is for navigation the component
  className?: string;
  visibleCondition?: boolean;
  disableCondition?: boolean;
}
