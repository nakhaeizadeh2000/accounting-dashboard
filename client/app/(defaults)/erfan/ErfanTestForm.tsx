'use client';
import DatePickerSimpleComponent from '@/components/modules/date-pickers/DatePickerSimpleComponent';
import TimePickersSimpleComponent from '@/components/modules/date-pickers/TimePickersSimpleComponent';
import Editor from '@/components/modules/editor/TinyMceComponent';
import { TextField } from '@mui/material';
import { StaticDatePicker } from '@mui/x-date-pickers-pro';
import { PiAirplaneTakeoffDuotone } from 'react-icons/pi';
import AdvancedBadgeExample from '@/components/modules/badge/examples/AdvancedBadgeExample';
import SimpleBadgeExample from '@/components/modules/badge/examples/SimpleBadgeExample';
import AnimatedBadgeExample from '@/components/modules/badge/examples/AnimatedBadgeExample';
import CheckboxExample from '@/components/modules/checkBox/examples/CheckBoxExample';
import { AdvancedSwitchButtonExample } from '@/components/modules/switch-button/examples/AdvancedSwitchButtonExample';
import { SimpleSwitchButtonExample } from '@/components/modules/switch-button/examples/SimpleSwitchButtonExample';
import { SwitchButtonIconExample } from '@/components/modules/switch-button/examples/IconSwitchButtonExample';
import AdvancedButtonExample from '@/components/modules/button/examples/AdvancedButtonExample';
import SimpleButtonExample from '@/components/modules/button/examples/SimpleButtonExample';
import FactoryExample from '@/components/modules/button-advanced/examples/ButtonFactoryExample';
import ButtonUsageExamples from '@/components/modules/button-advanced/examples/ButtonUsageExample';
import HooksExample from '@/components/modules/button-advanced/examples/HooksExample';
import ComponentModalExample from '@/components/modules/modal/examples/ComponentModalExample';
import BridgeExample from '@/components/modules/modal/examples/BridgeModalExample';
import TinyEditor from '@/components/modules/editor/TinyMceComponent';
import TextFieldMuiComponent from '@/components/modules/input-elements/components/TextFieldMuiComponent';
import { MdEmail } from 'react-icons/md';

const ErfanTestForm = () => {
  const setDate = (date: Date | null) => {
    if (date) {
      const localDate = new Date(date);
      const utcDate = localDate.toISOString();
      // console.log(utcDate, 'parent');
    }
  };

  const setTime = (time: string) => {
    if (time) {
      // console.log(time, 'parent time');
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.checked);
  };

  const persianDayFormatter = (date: Date) => {
    const persianDays = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
    const dayIndex = date.getDay();
    return persianDays[dayIndex];
  };

  return (
    <div className="m-2 mt-3 flex w-full flex-1 flex-col justify-center gap-2 overflow-y-auto">
      <TimePickersSimpleComponent
        options={{ label: 'ساعت', getValue: setTime, formatTime: 'HH:mm' }}
      />
      <hr className="m-4" />
      <DatePickerSimpleComponent
        options={{
          label: 'تاریخ',
          getValue: setDate,
          views: ['year', 'month', 'day'],
          openModalDefault: 'day',
          showClearable: true,
          disablePast: true,
          openButtonIcon: PiAirplaneTakeoffDuotone,
        }}
      />
      <hr className="m-4" />
      <span className="text-lg">TextField</span>
      <div className="flex items-center justify-center gap-4">
        <TextField id="outlined-basic" label="ایمیل" variant="outlined" size="small" />
        <TextFieldMuiComponent
          label="Email"
          onChange={(data) => console.log(data)}
          icon={<MdEmail />}
        />
      </div>
      <hr className="m-4" />
      <StaticDatePicker orientation="landscape" dayOfWeekFormatter={persianDayFormatter} />
      <hr className="m-4" />
      <TinyEditor onChange={(data) => console.log(data)} initOptionsTinyMce={{ height: 700 }} />
      <hr className="m-4" />
      <span className="text-lg">Badge</span>
      <AdvancedBadgeExample />
      <SimpleBadgeExample />
      <AnimatedBadgeExample />
      <hr className="m-4" />
      <span className="text-lg">CheckBox</span>
      <CheckboxExample />
      <hr className="m-4" />
      <span className="text-lg">Switch</span>
      <div className="flex items-center justify-center gap-4">
        <AdvancedSwitchButtonExample />
        <SimpleSwitchButtonExample />
        <SwitchButtonIconExample />
      </div>
      <hr className="m-4" />
      <span className="text-lg">Button</span>
      <AdvancedButtonExample />
      <SimpleButtonExample />
      <hr className="m-4" />
      <span className="text-lg">advanced-Button</span>
      <FactoryExample />
      <ButtonUsageExamples />
      <HooksExample />
      <hr className="m-4" />
      <span className="text-lg">modal</span>
      <ComponentModalExample />
      <BridgeExample />
    </div>
  );
};

export default ErfanTestForm;
