import { Fa42Group, FaApple, FaPhone, FaUserCheck } from 'react-icons/fa6';
import { CiBookmarkCheck } from 'react-icons/ci';
import { RxAlignBaseline, RxCardStackPlus, RxComponent1, RxDashboard } from 'react-icons/rx';
import { SideBarNavItems } from '@/shared/types/sidebar-nav.model';

export const sideBarMenu: SideBarNavItems[] = [
  // {
  //   type: 'link',
  //   name: 'apps',
  //   IconComponent: RxAlignBaseline,
  //   link: '/',
  // },
  {
    titleHeader: 'apps',
    IconHeader: RxCardStackPlus,
    type: 'GroupNav',
    childrenHeader: [
      {
        name: 'test4',
        IconComponent: FaPhone,
        type: 'dropDown',
        childrenItem: [
          {
            IconComponent: CiBookmarkCheck,
            name: 'test3',
            link: '/userList',
          },
        ],
      },
      {
        IconComponent: Fa42Group,
        type: 'link',
        name: 'test1',
        link: '/',
        // link: '/user',
      },
      {
        IconComponent: FaApple,
        type: 'link',
        name: 'test2',
        link: '/',
      },
      {
        IconComponent: CiBookmarkCheck,
        type: 'link',
        name: 'test3',
        link: '/',
      },
      {
        type: 'dropDown',
        name: 'dashboard',
        IconComponent: RxDashboard,
        childrenItem: [
          {
            name: 'sales',
            IconComponent: '',
            link: '/',
          },
          {
            name: 'finance',
            IconComponent: '',
            link: '/',
          },
          {
            name: 'analytics',
            IconComponent: '',
            link: '/',
          },
          {
            name: 'crypto',
            IconComponent: '',
            link: '/',
          },
        ],
      },
    ],
  },
  {
    titleHeader: 'user_Interface',
    type: 'GroupNav',
    IconHeader: FaUserCheck,
    childrenHeader: [
      {
        type: 'dropDown',
        name: 'components',
        IconComponent: RxComponent1,
        childrenItem: [
          {
            name: 'tabs',
            IconComponent: '',
            link: '/',
          },
          {
            name: 'accordions',
            IconComponent: '',
            link: '/',
          },
          {
            name: 'modals',
            IconComponent: '',
            link: '/',
          },
          {
            name: 'cards',
            IconComponent: '',
            link: '/',
          },
          {
            name: 'carousel',
            IconComponent: '',
            link: '/',
          },
          {
            name: 'countdown',
            IconComponent: '',
            link: '/',
          },
          {
            name: 'counter',
            IconComponent: '',
            link: '/',
          },
          {
            name: 'sweet_alert',
            IconComponent: '',
            link: '/',
          },
          {
            name: 'timeline',
            IconComponent: '',
            link: '/',
          },
        ],
      },
    ],
  },
];
