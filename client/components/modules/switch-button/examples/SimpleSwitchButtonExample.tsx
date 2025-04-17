// components/examples/SimpleSwitchButtonExample.tsx
import React, { useState } from 'react';
import { SwitchButton } from '../components/SwitchButton';

export const SimpleSwitchButtonExample: React.FC = () => {
  // Use state for all switches to create controlled components
  const [switches, setSwitches] = useState({
    basic: true,
    material: false,
    ios: false,
    android: false,
    materialDisabled: true,
    iosDisabled: true,
    androidDisabled: true,
  });

  // Generic handler for any switch
  const handleChange =
    (switchName: keyof typeof switches) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setSwitches((prev) => ({
        ...prev,
        [switchName]: event.target.checked,
      }));
    };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl">Simple Switch Button Example</h2>

      <div className="mb-6">
        <h3 className="mb-2 font-medium">Material Style (Default)</h3>
        <div className="flex items-center space-x-4">
          <SwitchButton
            onChange={handleChange('basic')}
            checked={switches.basic}
            switchStyle="material"
          />
          <span>Basic Switch</span>
        </div>

        <div className="mt-2 flex items-center space-x-4">
          <SwitchButton
            label="With Label"
            onChange={handleChange('material')}
            checked={switches.material}
            color="success"
            switchStyle="material"
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-2 font-medium">iOS Style</h3>
        <div className="flex items-center space-x-4">
          <SwitchButton onChange={handleChange('ios')} checked={switches.ios} switchStyle="ios" />
          <span>Basic Switch</span>
        </div>

        <div className="mt-2 flex items-center space-x-4">
          <SwitchButton
            label="With Label"
            onChange={handleChange('ios')}
            checked={switches.ios}
            color="error"
            switchStyle="ios"
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-2 font-medium">Android Style</h3>
        <div className="flex items-center space-x-4">
          <SwitchButton
            onChange={handleChange('android')}
            checked={switches.android}
            switchStyle="android"
          />
          <span>Basic Switch</span>
        </div>

        <div className="mt-2 flex items-center space-x-4">
          <SwitchButton
            label="With Label"
            onChange={handleChange('android')}
            checked={switches.android}
            color="warning"
            switchStyle="android"
          />
        </div>
      </div>

      <div className="mb-4">
        <h3 className="mb-2 font-medium">Disabled States</h3>
        <div className="flex items-center space-x-4">
          <SwitchButton disabled checked={switches.materialDisabled} switchStyle="material" />
          <span>Material</span>
        </div>

        <div className="mt-2 flex items-center space-x-4">
          <SwitchButton disabled checked={switches.iosDisabled} switchStyle="ios" />
          <span>iOS</span>
        </div>

        <div className="mt-2 flex items-center space-x-4">
          <SwitchButton disabled checked={switches.androidDisabled} switchStyle="android" />
          <span>Android</span>
        </div>
      </div>

      <div className="mt-6 rounded bg-gray-100 p-3">
        <p>Switch States:</p>
        <pre className="mt-2 text-xs">{JSON.stringify(switches, null, 2)}</pre>
      </div>
    </div>
  );
};
