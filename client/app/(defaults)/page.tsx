import AnimatedDropDown from '@/components/Elements/drop-downs/AnimatedDropDown';
import AnimatedInputElement from '@/components/Elements/input-elements/AnimatedInputElement';
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
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <AnimatedDropDown options={{ label: 'menu', navClassNames: 'w-1/5 w' }} />
          <AnimatedDropDown options={{ label: 'menu', navClassNames: 'w-4/5' }} />
        </div>
        <div className="flex gap-2">
          <AnimatedDropDown options={{ label: 'menu', navClassNames: 'w-4/5 w' }} />
          <AnimatedDropDown options={{ label: 'menu', navClassNames: 'w-1/5 w' }} />
        </div>
      </div>
    </div>
  );
};

export default Sales;
