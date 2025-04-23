import { Route } from 'next';
import { IconType } from 'react-icons';
import { Url } from 'url';

export interface ItemType {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: IconType | string;
}

export interface Props {
  options: {
    label: string;
    navClass?: string;
    containerClass?: string;
    labelClass?: string;
    isMarquee?: boolean;
    items: ItemType[];
    selectedValue?: ItemType[]; // To hold the selected value
    onChange: (items: ItemType[]) => void; // Callback to handle change
    isLoading?: boolean;
    onFullScroll?: () => void;
    isLTR?: boolean;
    isMultiSelectable?: boolean;
    multiSelectLabelsViewType?: 'simple' | 'chips';
    appendToBody?: boolean;
    isDisabled?: boolean; // Prop for disabled state
    isValid?: boolean; // Prop for validation state
  };
}

// For sidebar dropdown integration
export interface DropDownSidebarProps {
  item: {
    name: string;
    link?: Route<string> | Url;
    IconComponent: IconType | string;
    type: 'dropDown';
    childrenItem: { name: string; link: Route<string> | Url; IconComponent: IconType | string }[];
  };
  pathName: string;
}

export interface MuiDropDownOptions {
  label: string;
  items: ItemType[];
  selectedValue?: ItemType[];
  onChange: (items: ItemType[]) => void;
  isLoading?: boolean;
  onFullScroll?: () => void;
  isMarquee?: boolean;
  isLTR?: boolean;
  isMultiSelectable?: boolean;
  multiSelectLabelsViewType?: 'simple' | 'chips';
  isDisabled?: boolean;
  isValid?: boolean;
}

export interface MuiDropDownProps {
  options: MuiDropDownOptions;
}
