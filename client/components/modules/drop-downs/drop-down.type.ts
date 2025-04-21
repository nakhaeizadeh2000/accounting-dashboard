export type ItemType = { value: string | number; label: string };

export type Props = {
  options: {
    label: string;
    navClass?: string;
    containerClass?: string;
    labelClass?: string;
    isMarquee?: boolean;
    items?: ItemType[];
    selectedValue?: ItemType[]; // To hold the selected value
    onChange: (item: ItemType[]) => void; // Callback to handle change
    isLoading: boolean;
    onFullScroll?: () => void;
    isLTR?: boolean;
    isMultiSelectable?: boolean;
    multiSelectLabelsViewType?: 'simple' | 'chips';
    appendToBody?: boolean;
  };
};

export type SelectedLabelProps = {
  selectedItems: ItemType[];
  isMarquee: boolean;
  isLTR: boolean;
  multiSelectLabelsViewType: 'simple' | 'chips';
  isMultiSelectable: boolean; // Add this line
  onChangeSelection: (item: ItemType) => void; // Callback to handle item removal
};
