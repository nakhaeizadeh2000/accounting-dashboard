// components/examples/SwitchButtonIconExample.tsx
import React, { useState } from 'react';
import { SwitchButton } from '../components/SwitchButton';
import { SwitchButtonStyle } from '../types/switchButtonTypes';
import {
  MdBluetoothDisabled,
  MdOutlineDarkMode,
  MdOutlineLightMode,
  MdWifiOff,
} from 'react-icons/md';
import { FaVolumeOff, FaWifi } from 'react-icons/fa6';
import { FaBluetooth, FaVolumeUp } from 'react-icons/fa';

export const SwitchButtonIconExample: React.FC = () => {
  // State for all switches
  const [switches, setSwitches] = useState({
    darkMode: false,
    volume: true,
    wifi: true,
    bluetooth: false,
  });

  // State for the selected style
  const [switchStyle, setSwitchStyle] = useState<SwitchButtonStyle>('material');

  // Generic handler for any switch
  const handleChange =
    (switchName: keyof typeof switches) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setSwitches((prev) => ({
        ...prev,
        [switchName]: event.target.checked,
      }));
    };

  // Handle style change
  const handleStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSwitchStyle(event.target.value as SwitchButtonStyle);
  };

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-bold">Switch Button with Icons</h2>

      <div className="mb-6">
        <label htmlFor="switchStyle" className="mb-2 block text-sm font-medium text-gray-700">
          Select Switch Style:
        </label>
        <select
          id="switchStyle"
          value={switchStyle}
          onChange={handleStyleChange}
          className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:outline-none"
        >
          <option value="material">Material Design</option>
          <option value="ios">iOS Style</option>
          <option value="android">Android Style</option>
        </select>
      </div>

      <div className="space-y-8">
        {/* Dark Mode Switch with Icons */}
        <div className="border-b pb-4">
          <h3 className="mb-4 text-lg font-medium">Dark Mode Toggle</h3>

          <div className="mb-2 flex items-center justify-between">
            <span>Icon at start (default):</span>
            <SwitchButton
              onChange={handleChange('darkMode')}
              checked={switches.darkMode}
              color="secondary"
              icon={<MdOutlineLightMode />}
              checkedIcon={<MdOutlineDarkMode />}
              switchStyle={switchStyle}
            />
          </div>

          <div className="mb-2 flex items-center justify-between">
            <span>Icon at end:</span>
            <SwitchButton
              onChange={handleChange('darkMode')}
              checked={switches.darkMode}
              color="secondary"
              icon={<MdOutlineLightMode />}
              checkedIcon={<MdOutlineDarkMode />}
              iconPosition="end"
              switchStyle={switchStyle}
            />
          </div>

          <div className="flex items-center justify-between">
            <span>With label:</span>
            <SwitchButton
              label="Dark Mode"
              onChange={handleChange('darkMode')}
              checked={switches.darkMode}
              color="secondary"
              icon={<MdOutlineLightMode />}
              checkedIcon={<MdOutlineDarkMode />}
              switchStyle={switchStyle}
            />
          </div>
        </div>

        {/* Volume Switch with Icons */}
        <div className="border-b pb-4">
          <h3 className="mb-4 text-lg font-medium">Volume Toggle</h3>

          <div className="flex items-center justify-between">
            <SwitchButton
              label="Volume"
              onChange={handleChange('volume')}
              checked={switches.volume}
              color="success"
              icon={<FaVolumeOff />}
              checkedIcon={<FaVolumeUp />}
              switchStyle={switchStyle}
            />
          </div>
        </div>

        {/* Wi-Fi Switch with Icons */}
        <div className="border-b pb-4">
          <h3 className="mb-4 text-lg font-medium">Wi-Fi Toggle</h3>

          <div className="flex items-center justify-between">
            <SwitchButton
              label="Wi-Fi"
              onChange={handleChange('wifi')}
              checked={switches.wifi}
              color="primary"
              icon={<MdWifiOff />}
              checkedIcon={<FaWifi />}
              switchStyle={switchStyle}
            />
          </div>
        </div>

        {/* Bluetooth Switch with Icons */}
        <div className="border-b pb-4">
          <h3 className="mb-4 text-lg font-medium">Bluetooth Toggle</h3>

          <div className="flex items-center justify-between">
            <SwitchButton
              label="Bluetooth"
              onChange={handleChange('bluetooth')}
              checked={switches.bluetooth}
              color="info"
              icon={<MdBluetoothDisabled />}
              checkedIcon={<FaBluetooth />}
              switchStyle={switchStyle}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 rounded bg-gray-100 p-4">
        <h3 className="mb-2 font-semibold">Current Settings:</h3>
        <pre className="text-xs">{JSON.stringify({ ...switches, switchStyle }, null, 2)}</pre>
      </div>
    </div>
  );
};
