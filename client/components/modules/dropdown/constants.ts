export const DROPDOWN_ANIMATION_VARIANTS = {
  open: {
    clipPath: 'inset(0% 0% 0% 0% round 5px)',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.5,
    },
  },
  closed: {
    clipPath: 'inset(10% 50% 90% 50% round 5px)',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.3,
    },
  },
};

export const DROPDOWN_LIST_VARIANTS = {
  open: {
    clipPath: 'inset(0% 0% 0% 0% round 5px)',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.5,
    },
  },
  closed: {
    clipPath: 'inset(10% 50% 90% 50% round 5px)',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.3,
    },
  },
};

export const DROPDOWN_ARROW_VARIANTS = {
  open: { rotate: 180 },
  closed: { rotate: 0 },
};

export const NO_ITEMS_MESSAGE = '!داده ای جهت نمایش وجود ندارد';
