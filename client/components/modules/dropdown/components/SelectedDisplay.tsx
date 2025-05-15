import React from 'react';
import Marquee from 'react-fast-marquee';
import { HiMiniXMark } from 'react-icons/hi2';
import { SelectedDisplayProps } from '../types';
import styles from '../dropdown.module.scss';

const SelectedDisplay: React.FC<SelectedDisplayProps> = ({
  selectedItems,
  isMarquee = false,
  isLTR = false,
  multiSelectLabelsViewType = 'simple',
  isMultiSelectable = false,
  onChangeSelection,
}) => {
  if (!selectedItems.length) return null;

  // Single selection display
  if (!isMultiSelectable) {
    return isMarquee ? (
      <Marquee
        speed={50}
        autoFill={true}
        direction={isLTR ? 'left' : 'right'}
        className={styles['dropdown-marquee-container']}
      >
        <p className={styles['dropdown-marquee-content']}>{selectedItems[0].label}</p>
      </Marquee>
    ) : (
      <p className={styles['dropdown-single-value']}>{selectedItems[0].label}</p>
    );
  }

  // Multi selection display - Simple (comma-separated)
  if (multiSelectLabelsViewType === 'simple') {
    const displayText = selectedItems.map((item) => item.label).join(', ');

    return isMarquee ? (
      <Marquee
        speed={50}
        autoFill={true}
        direction={isLTR ? 'left' : 'right'}
        className={styles['dropdown-marquee-container']}
      >
        <p className={styles['dropdown-marquee-content']}>{displayText}</p>
      </Marquee>
    ) : (
      <p className={styles['dropdown-multi-value-simple']}>{displayText}</p>
    );
  }

  // Multi selection display - Chips
  return (
    <div
      className={`${styles['dropdown-multi-value-chips']} ${isMarquee ? styles['marquee'] : ''}`}
    >
      {isMarquee ? (
        <Marquee
          speed={50}
          autoFill={true}
          direction={isLTR ? 'left' : 'right'}
          className={styles['dropdown-marquee-container']}
        >
          <div className="flex gap-2">
            {selectedItems.map((item) => (
              <div key={item.value} className={styles['dropdown-chip']}>
                <span>{item.label}</span>
                <HiMiniXMark
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeSelection(item);
                  }}
                  className={styles['dropdown-chip-remove']}
                />
              </div>
            ))}
          </div>
        </Marquee>
      ) : (
        <>
          {selectedItems.map((item) => (
            <div key={item.value} className={styles['dropdown-chip']}>
              <span>{item.label}</span>
              <HiMiniXMark
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeSelection(item);
                }}
                className={styles['dropdown-chip-remove']}
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default SelectedDisplay;
