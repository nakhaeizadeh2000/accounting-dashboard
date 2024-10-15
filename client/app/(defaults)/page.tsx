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
      <div className="columns-2 gap-2">
        <div>
          <AnimatedDropDown />
        </div>
        <AnimatedInputElement
          options={{ key: 'email', label: 'ایمیل', type: 'text', fieldError: undefined }}
        />
      </div>
    </div>
  );
};

export default Sales;
