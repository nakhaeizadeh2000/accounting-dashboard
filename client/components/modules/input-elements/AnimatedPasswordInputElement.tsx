'use client';

import { useState } from 'react';
import AnimatedInputElement from './AnimatedInputElement';
import { FaRegEye } from 'react-icons/fa';
import { FaRegEyeSlash } from 'react-icons/fa';

type Options = { passwordFieldErrors?: string[] | undefined };

const AnimatedPasswordInputelement = ({ passwordFieldErrors }: Options) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <AnimatedInputElement
      options={{
        key: 'password',
        type: isVisible ? 'text' : 'password',
        label: 'رمزعبور',
        fieldError: passwordFieldErrors,
        icon: {
          Icon: () =>
            isVisible ? (
              <FaRegEyeSlash
                className="hover:cursor-pointer"
                onClick={() => setIsVisible((prev) => !prev)}
              ></FaRegEyeSlash>
            ) : (
              <FaRegEye
                className="hover:cursor-pointer"
                onClick={() => setIsVisible((prev) => !prev)}
              ></FaRegEye>
            ),
        },
      }}
    />
  );
};

export default AnimatedPasswordInputelement;
