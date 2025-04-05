import { Chip } from '@mui/material';
import Marquee from 'react-fast-marquee';
import styles from './dropdown.module.scss';
import { SelectedLabelProps } from './drop-down.type';

export const SelectedLabel = ({
  selectedItems,
  isMarquee,
  isLTR,
  multiSelectLabelsViewType,
  onChangeSelection,
  isMultiSelectable,
}: SelectedLabelProps) => {
  if (!selectedItems.length) return null;

  if (!isMultiSelectable) {
    return isMarquee ? (
      <Marquee
        speed={50}
        autoFill={true}
        pauseOnHover={true}
        direction={isLTR ? 'left' : 'right'}
        className={'direction-ltr'}
      >
        <p className="text-nowrap px-2 leading-[1.6]">{selectedItems[0].label}</p>
      </Marquee>
    ) : (
      <p
        className={`text-nowrap px-2 leading-[1.6] ${isLTR ? 'text-left direction-ltr' : 'text-right direction-rtl'}`}
      >
        {selectedItems[0].label}
      </p>
    );
  } else {
    if (multiSelectLabelsViewType === 'simple') {
      return (
        <p
          className={`text-nowrap leading-[1.6] ${isLTR ? 'text-left direction-ltr' : 'text-right direction-rtl'}`}
        >
          {selectedItems.map((item, index) =>
            index === selectedItems.length - 1 ? item.label : `${item.label}, `,
          )}
        </p>
      );
    }
    if (multiSelectLabelsViewType === 'chips') {
      return selectedItems.map((item) => (
        <Chip
          className={styles.chips_margin}
          key={item.value}
          label={item.label}
          onDelete={() => onChangeSelection(item)}
        />
      ));
    }
  }
};
