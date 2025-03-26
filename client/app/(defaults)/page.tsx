import { Metadata } from 'next';

import TestForm from './TestForm';
import ErfanTestForm from './ErfanTestForm';

export const metadata: Metadata = {
  title: 'SalsetDatees Admin',
};

const Sales = () => {
  return (
    <>
      <TestForm />
      <ErfanTestForm />
    </>
  );
};

export default Sales;
