// CheckboxExample.tsx - Simple example
'use client';

import React, { useState } from 'react';
import { BsCheckCircle, BsCircle } from 'react-icons/bs';
import Checkbox from '../components/CheckBox';
import CheckboxGroup from '../components/CheckBoxGroup';
import IndeterminateCheckbox from '../components/IndeterminateCheckbox';
import AdvancedCheckbox from '../components/AdvancedCheckBox';

const CheckboxExample = () => {
  // State for basic checkboxes
  const [isChecked, setIsChecked] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // State for checkbox group
  const [selectedFruits, setSelectedFruits] = useState<Array<string | number>>(['apple', 'banana']);

  // State for indeterminate checkbox
  const [selectedPermissions, setSelectedPermissions] = useState<Array<string | number>>(['read']);

  // Fruit options for CheckboxGroup
  const fruitOptions = [
    { id: 'apple', label: 'Apple', value: 'apple' },
    { id: 'banana', label: 'Banana', value: 'banana' },
    { id: 'orange', label: 'Orange', value: 'orange' },
    { id: 'strawberry', label: 'Strawberry', value: 'strawberry' },
    { id: 'grape', label: 'Grape', value: 'grape', disabled: true },
  ];

  // Permission options for IndeterminateCheckbox
  const permissionOptions = [
    { id: 'read', label: 'Read', value: 'read' },
    { id: 'write', label: 'Write', value: 'write' },
    { id: 'delete', label: 'Delete', value: 'delete' },
  ];

  // Create a toggle switch using AdvancedCheckbox
  // const ToggleSwitch = createToggleSwitch({
  //   label: 'Enable notifications',
  //   checked: notificationsEnabled,
  //   onChange: (checked) => setNotificationsEnabled(checked),
  //   activeColor: 'bg-green-500',
  // });

  return (
    <div className="mx-auto space-y-8 p-6">
      <h2 className="mb-6 text-2xl font-bold">Checkbox Examples</h2>
      <div className="flex w-full items-end justify-center">
        <section className="m-2 space-y-4">
          <h3 className="text-xl font-semibold">Basic Checkbox</h3>
          <div className="rounded border p-4">
            <Checkbox
              label="Standard checkbox"
              checked={isChecked}
              onChange={(e, checked) => setIsChecked(checked)}
            />

            <div className="mt-2 text-sm">Value: {isChecked ? 'Checked' : 'Unchecked'}</div>
          </div>
        </section>

        {/* Custom Icons */}
        <section className="m-2 space-y-4">
          <h3 className="text-xl font-semibold">Custom Icons</h3>
          <div className="rounded border p-4">
            <Checkbox
              label="Custom icon checkbox"
              icon={<BsCircle className="text-gray-400" size={20} />}
              checkedIcon={<BsCheckCircle className="text-green-500" size={20} />}
            />
          </div>
        </section>

        {/* Checkbox Group */}
        <section className="m-2 space-y-4">
          <h3 className="text-xl font-semibold">Checkbox Group</h3>
          <div className="rounded border p-4">
            <CheckboxGroup
              options={fruitOptions}
              value={selectedFruits}
              onChange={setSelectedFruits}
              rootOptions={{
                title: 'Select your favorite fruits',
                orientation: 'vertical',
                className: 'space-y-2',
              }}
              checkboxOptions={{
                color: 'success',
                size: 'small',
              }}
            />

            <div className="mt-4 rounded bg-gray-50 p-2 text-sm">
              Selected fruits: {selectedFruits.join(', ') || 'None'}
            </div>
          </div>
        </section>

        {/* Indeterminate Checkbox */}
        <section className="m-2 space-y-4">
          <h3 className="text-xl font-semibold">Indeterminate Checkbox</h3>
          <div className="rounded border p-4">
            <IndeterminateCheckbox
              label="Permissions"
              childOptions={permissionOptions}
              selectedValues={selectedPermissions}
              onChange={setSelectedPermissions}
              groupOptions={{
                orientation: 'vertical',
              }}
              childCheckboxOptions={{
                size: 'small',
              }}
            />

            <div className="mt-4 rounded bg-gray-50 p-2 text-sm">
              Selected permissions: {selectedPermissions.join(', ') || 'None'}
            </div>
          </div>
        </section>

        {/* Advanced Checkbox */}
        {/* <section className="m-2 space-y-4">
          <h3 className="text-xl font-semibold">Advanced Checkbox</h3>
          <div className="rounded border p-4">
            <AdvancedCheckbox
              label="Animated checkbox with ripple"
              enableRipple={true}
              rippleDuration={750}
              checkedContent={
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              }
              uncheckedContent={<div className="h-5 w-5 rounded-md border-2 border-gray-300" />}
              rippleClassName="bg-blue-200"
              onChange={(checked) => console.log('Animated checkbox:', checked)}
            />
          </div>
        </section> */}
      </div>
      {/* Basic Checkbox */}
    </div>
  );
};

export default CheckboxExample;
