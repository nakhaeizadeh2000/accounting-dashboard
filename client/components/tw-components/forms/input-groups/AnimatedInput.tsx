'use client'; // Ensure this component is treated as a client component

import { motion } from 'framer-motion';

const AnimatedInput = ({
  isVisible = true,
  isDisabled = false,
}: {
  isVisible?: boolean;
  isDisabled?: boolean;
}) => {
  return isVisible ? (
    <motion.div
      initial={{ opacity: 0, translateY: -20 }} // Start off-screen and transparent
      animate={{ opacity: 1, translateY: 0 }} // Animate to visible position
      exit={{ opacity: 0, translateY: -20 }} // Animate out
      transition={{ duration: 0.3 }} // Duration of the animation
      className="relative"
    >
      <label
        htmlFor="name"
        className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900"
      >
        Name
      </label>
      <input
        type="text"
        name="name"
        id="name"
        disabled={isDisabled}
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        placeholder="Jane Smith"
      />
    </motion.div>
  ) : null;
};

export default AnimatedInput;
