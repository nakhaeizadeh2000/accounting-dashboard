'use client';

import { motion } from 'framer-motion';
import styles from './styles/ButtonLoading.module.scss';

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

const ButtonLoading = ({ colorClassName = 'bg-indigo-600' }: { colorClassName?: string }) => {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={styles.loader}
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div className={`${styles.bar} ${colorClassName}`} variants={barVariants} />
        <motion.div className={`${styles.bar} ${colorClassName}`} variants={barVariants} />
        <motion.div className={`${styles.bar} ${colorClassName}`} variants={barVariants} />
      </motion.div>
    </div>
  );
};

export default ButtonLoading;
