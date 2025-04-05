import { btnNavigation } from '@/components/modules/tab-navigation/btn-navigation.model';
import { FaUser, FaUserCheck } from 'react-icons/fa6';

export const btnTabs: btnNavigation[] = [
  { label: 'لیست', link: '/user/main/list', Icon: FaUser },
  { label: 'جدید', link: '/user/main/add', Icon: FaUserCheck },
];

// import { BtnNavigation } from '@/components/modules/tab-navigation/btn-navigation.model';
// import { FaUser, FaUserCheck } from 'react-icons/fa6';

// export const btnTabs: BtnNavigation[] = [
//   { type: 'link', label: 'لیست', link: '/user/list', Icon: FaUser },
//   { type: 'link', label: '1جدید', link: '/user/add', Icon: FaUserCheck },
//   { type: 'link', label: '2جدید', link: '/user/add', Icon: FaUserCheck, disableCondition: true },
//   { type: 'link', label: '3جدید', link: '/user/add', Icon: FaUserCheck },
//   { type: 'link', label: '4جدید', link: '/user/add', Icon: FaUserCheck },
//   { type: 'link', label: '5جدید', link: '/user/add', Icon: FaUserCheck },
//   { type: 'link', label: '6جدید', link: '/user/add', Icon: FaUserCheck },
//   { type: 'link', label: '7جدید', link: '/user/add', Icon: FaUserCheck },
//   { type: 'link', label: '8جدید', link: '/user/add', Icon: FaUserCheck },
//   { type: 'link', label: '9جدید', link: '/user/add', Icon: FaUserCheck },
//   {
//     type: 'dropDown',
//     label: '10جدید',
//     Icon: FaUserCheck,
//     children: [
//       { type: 'link', label: '1جدید', link: '/user/add', Icon: FaUserCheck },
//       { type: 'link', label: '3جدید', link: '/user/add', Icon: FaUserCheck },
//       { type: 'link', label: '5جدید', link: '/user/add', Icon: FaUserCheck },
//       { type: 'link', label: '7جدید', link: '/user/add', Icon: FaUserCheck },
//     ],
//   },
//   {
//     type: 'dropDown',
//     label: '11جدید',
//     Icon: FaUserCheck,
//     children: [
//       { type: 'link', label: '4جدید', link: '/user/add', Icon: FaUserCheck },
//       { type: 'link', label: '6جدید', link: '/user/add', Icon: FaUserCheck },
//       { type: 'link', label: '8جدید', link: '/user/add', Icon: FaUserCheck },
//       { type: 'link', label: '10جدید', link: '/user/add', Icon: FaUserCheck },
//     ],
//   },
//   { type: 'link', label: '12جدید', link: '/user/add', Icon: FaUserCheck },
//   {
//     type: 'dropDown',
//     label: '13جدید',
//     Icon: FaUserCheck,
//     children: [
//       { type: 'link', label: '11جدید', link: '/user/add', Icon: FaUserCheck },
//       { type: 'link', label: '13جدید', link: '/user/add', Icon: FaUserCheck },
//       { type: 'link', label: '17جدید', link: '/user/add', Icon: FaUserCheck },
//       { type: 'link', label: '19جدید', link: '/user/add', Icon: FaUserCheck },
//     ],
//   },
//   { type: 'link', label: '14جدید', link: '/user/add', Icon: FaUserCheck },
// ];
