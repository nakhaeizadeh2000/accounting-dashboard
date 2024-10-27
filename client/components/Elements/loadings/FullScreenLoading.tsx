'use client';

import { LazyMotion, m } from 'framer-motion';
import styles from './styles/FullScreenLoading.module.scss';

const loadLazyMotionFeatures = () =>
  import('@/components/lazy-framer-motion').then((res) => res.default);

const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const barVariants = {
  initial: { scaleY: 1 },
  animate: {
    scaleY: [1, 0.2, 1],
    transition: {
      repeat: Infinity,
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
};

const LoaderBar = () => <m.div className={styles.bar} variants={barVariants} />;

const FullScreenLoading = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <LazyMotion features={loadLazyMotionFeatures}>
        <m.div
          className={styles.loader}
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <LoaderBar />
          <LoaderBar />
          <LoaderBar />
        </m.div>
      </LazyMotion>
    </div>
  );
};

export default FullScreenLoading;
