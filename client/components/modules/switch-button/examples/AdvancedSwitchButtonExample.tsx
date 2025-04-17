// components/examples/AdvancedSwitchButtonExample.tsx
import React, { useState } from 'react';
import { SwitchButton } from '../components/SwitchButton';
import { SwitchButtonColor, LabelPlacement, SwitchButtonStyle } from '../types/switchButtonTypes';

export const AdvancedSwitchButtonExample: React.FC = () => {
  // State for all switch settings
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    autoSave: true,
    analytics: false,
    dataSync: true,
  });

  // State for the selected style
  const [switchStyle, setSwitchStyle] = useState<SwitchButtonStyle>('material');

  // Different colors for each setting
  const colors: Record<string, SwitchButtonColor> = {
    darkMode: 'secondary',
    notifications: 'success',
    autoSave: 'primary',
    analytics: 'warning',
    dataSync: 'info',
  };

  // Different label placements for demonstration
  const labelPlacements: Record<string, LabelPlacement> = {
    darkMode: 'start',
    notifications: 'end',
    autoSave: 'top',
    analytics: 'bottom',
    dataSync: 'end',
  };

  // Handle change for any setting
  const handleChange =
    (setting: keyof typeof settings) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setSettings({
        ...settings,
        [setting]: event.target.checked,
      });
    };

  // Format setting name for display (camelCase to Title Case with spaces)
  const formatSettingName = (key: string): string => {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
  };

  // Handle style change
  const handleStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSwitchStyle(event.target.value as SwitchButtonStyle);
  };

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-bold">Application Settings</h2>

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

      <div className="space-y-6">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <SwitchButton
              label={formatSettingName(key)}
              labelPlacement={labelPlacements[key]}
              onChange={handleChange(key as keyof typeof settings)}
              checked={value} // Using checked instead of defaultChecked for controlled component
              color={colors[key]}
              size="small"
              switchStyle={switchStyle}
            />
            <span className={`ml-2 text-sm ${value ? 'text-green-500' : 'text-gray-500'}`}>
              {value ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded bg-gray-100 p-4">
        <h3 className="mb-2 font-semibold">Current Settings:</h3>
        <pre className="text-xs">{JSON.stringify({ ...settings, switchStyle }, null, 2)}</pre>
      </div>
    </div>
  );
};
