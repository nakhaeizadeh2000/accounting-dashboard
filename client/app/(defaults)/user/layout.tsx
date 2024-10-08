'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Route } from 'next';
import { btnNavigation } from '@/shared/types/btn-navigation.model';
import { FaChevronLeft, FaChevronRight, FaUser, FaUserCheck } from 'react-icons/fa6';
// import styles from './tab-navigaiton.module.scss';
import { usePathname } from 'next/navigation';

type Props = {
  children: React.ReactNode;
};

const tabVariants = {
  active: {
    backgroundColor: '#eee',
    color: '#8855ff',
    transition: { duration: 0.3 },
  },
  inactive: {
    backgroundColor: 'transparent',
    color: '#1e293b',
    transition: { duration: 0.3 },
  },
};

const underlineVariants = {
  active: {
    width: '100%',
    transition: { duration: 0.3 },
  },
  inactive: {
    width: '0%',
    transition: { duration: 0.3 },
  },
};

const tabs: btnNavigation[] = [
  { label: 'لیست', link: '/user/list', Icon: FaUser },
  { label: 'جدید', link: '/user/add', Icon: FaUserCheck },
  { label: 'جدید', link: '/user/add', Icon: FaUserCheck },
  { label: 'جدید', link: '/user/add', Icon: FaUserCheck },
  { label: 'جدید', link: '/user/add', Icon: FaUserCheck },
  { label: 'جدید', link: '/user/add', Icon: FaUserCheck },
  { label: 'جدید', link: '/user/add', Icon: FaUserCheck },
  { label: 'جدید', link: '/user/add', Icon: FaUserCheck },
  // { label: 'جدید', link: '/user/add', Icon: FaUserCheck },
  // { label: 'جدید', link: '/user/add', Icon: FaUserCheck },
  // { label: 'جدید', link: '/user/add', Icon: FaUserCheck },
  // { label: 'جدید', link: '/user/add', Icon: FaUserCheck },
  // { label: 'جدید', link: '/user/add', Icon: FaUserCheck },
  // { label: 'جدید', link: '/user/add', Icon: FaUserCheck },
  // { label: 'جدید', link: '/user/add', Icon: FaUserCheck },
  // { label: 'جدید', link: '/user/add', Icon: FaUserCheck },
  // { label: 'جدید', link: '/user/add', Icon: FaUserCheck },
  // { label: 'جدید', link: '/user/add', Icon: FaUserCheck },
  // { label: 'جدید', link: '/user/add', Icon: FaUserCheck },
  // { label: 'جدید', link: '/user/add', Icon: FaUserCheck },
];

const Userlayout = (props: Props) => {
  // const pathName = usePathname();
  // const scrollContainerRef = useRef<HTMLUListElement>(null);
  // const [showLeftFade, setShowLeftFade] = useState(false);
  // const [showRightFade, setShowRightFade] = useState(true);

  // // const handleScroll = () => {
  // //   if (scrollContainerRef.current) {
  // //     const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
  // //     setShowLeftFade(scrollLeft > 0);
  // //     setShowRightFade(scrollLeft < scrollWidth - clientWidth - 1);
  // //   }
  // // };

  // // useEffect(() => {
  // //   handleScroll();
  // //   window.addEventListener('resize', handleScroll);
  // //   return () => window.removeEventListener('resize', handleScroll);
  // // }, []);

  // // const scroll = (direction: 'left' | 'right') => {
  // //   if (scrollContainerRef.current) {
  // //     const scrollAmount = direction === 'left' ? -200 : 200;
  // //     scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  // //   }
  // // };

  // return (
  //   <>
  //     <nav className="relative flex h-[44px] items-center overflow-hidden rounded-lg rounded-b-none border-b border-b-[#eeeeee] bg-[#fdfdfd]">
  //       {/* {showLeftFade && (
  //         <div className="absolute left-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent">
  //           <button
  //             onClick={() => scroll('left')}
  //             className="h-full w-full text-gray-600 focus:outline-none"
  //           >
  //             <FaChevronLeft />
  //           </button>
  //         </div>
  //       )} */}
  //       <ul
  //         ref={scrollContainerRef}
  //         className="scrollbar-hide flex h-full w-full list-none overflow-x-auto p-0 text-[14px] font-medium"
  //         // onScroll={handleScroll}
  //       >
  //         {tabs.map(({ Icon, ...item }) => (
  //           <motion.li
  //             key={item.label}
  //             variants={tabVariants}
  //             animate={item.link === pathName ? 'active' : 'inactive'}
  //             className="relative h-full flex-shrink-0"
  //             whileHover={item?.link !== pathName ? { scale: 0.95 } : { scale: 1 }}
  //           >
  //             <Link
  //               href={item?.link as Route}
  //               className="flex h-full w-32 items-center justify-center px-2 text-center"
  //             >
  //               {Icon && <Icon className="mr-1" />}
  //               <span className="truncate">{item.label}</span>
  //             </Link>
  //             {item.link === pathName && (
  //               <motion.div
  //                 className="absolute bottom-0 left-0 h-[2px] w-full bg-[#8855ff]"
  //                 layoutId="underline"
  //                 variants={underlineVariants}
  //                 animate={item.link === pathName ? 'active' : 'inactive'}
  //               />
  //             )}
  //           </motion.li>
  //         ))}
  //       </ul>
  //       {/* {showRightFade && (
  //         <div className="absolute right-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent">
  //           <button
  //             onClick={() => scroll('right')}
  //             className="h-full w-full text-gray-600 focus:outline-none"
  //           >
  //             <FaChevronRight />
  //           </button>
  //         </div>
  //       )} */}
  //     </nav>
  //     <main className="flex h-[500px] grow select-none items-center justify-center rounded-sm border-b border-b-[#eeeeee] bg-[#fdfdfd] p-[5px_5px_0]">
  //       {props.children}
  //     </main>
  //   </>
  // );
  const pathName = usePathname();
  console.log(pathName);
  return (
    <>
      <nav className="relative flex h-[44px] items-center overflow-hidden rounded-lg rounded-b-none border-b border-b-[#eeeeee] bg-[#fdfdfd] lg:right-2 lg:w-fit">
        <ul className="scrollbar-hide flex h-full list-none overflow-x-auto p-0 text-[14px] font-medium sm:w-full lg:max-w-[99.5rem]">
          {tabs.map(({ Icon, ...item }) => (
            <motion.li
              key={item.label}
              variants={tabVariants}
              animate={item.link === pathName ? 'active' : 'inactive'}
              className={`relative h-full flex-shrink-0 rounded-t-lg`}
              whileHover={item?.link !== pathName ? { scale: 0.9 } : { scale: 1 }}
            >
              <Link
                href={item?.link as Route}
                className={`flex h-full w-40 items-center justify-center text-center`}
              >
                {Icon && <Icon className="m-2" />}
                {item.label}
              </Link>
              {item.link === pathName && (
                <motion.div
                  className="absolute h-[1px] w-40 bg-[#8855ff]"
                  layoutId="underline"
                  variants={underlineVariants}
                  animate={item.link === pathName ? 'active' : 'inactive'}
                />
              )}
            </motion.li>
          ))}
        </ul>
      </nav>
      <main className="flex h-[500px] grow select-none items-center justify-center rounded-sm border-b border-b-[#eeeeee] bg-[#fdfdfd] p-[5px_5px_0]">
        {props.children}
      </main>
    </>
  );
};

export default Userlayout;
