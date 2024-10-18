import BadgesComponents from '@/components/modules/badges/BadgesComponents';
import { Metadata } from 'next';

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
        <BadgesComponents />
      </p>
    </div>
  );
};

export default Sales;
