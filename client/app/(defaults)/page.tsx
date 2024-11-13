import { Metadata } from 'next';
import TestForm from './TestForm';

export const metadata: Metadata = {
  title: 'Sales Admin',
};

const Sales = () => {
  return (
    <div>
      <p className="font-sans">This will use font-sans</p>
      <p className="font-yekan font-light">This will use YekanBakh Light</p>
      <p className="font-yekan font-normal">This will use YekanBakh Regular</p>
      <p className="font-yekan font-bold">
        This will use YekanBakh Bold <strong>this is testing</strong>
      </p>

      <TestForm />
    </div>
  );
};

export default Sales;
