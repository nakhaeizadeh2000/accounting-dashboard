'use client';

import { motion } from 'framer-motion';
import styles from './styles/LayerLoading.module.scss';

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

const LoaderBar = () => <motion.div className={styles.bar} variants={barVariants} />;

const LayerLoading = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <motion.div
        className={styles.loader}
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <LoaderBar />
        <LoaderBar />
        <LoaderBar />
      </motion.div>
    </div>
  );
};

export default LayerLoading;
