'use client';

import React, { useState } from 'react';

import Checkbox from '../components/CheckBox';
import AdvancedCheckbox from '../components/AdvancedCheckBox';
import CheckboxGroup from '../components/CheckBoxGroup';
import IndeterminateCheckbox from '../components/IndeterminateCheckbox';
import { BsCheckCircle, BsCheckSquare, BsCircle, BsSquare } from 'react-icons/bs';
import { FaMinus } from 'react-icons/fa6';
import { FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const AdvancedCheckBoxExample = () => {
  // State for CheckboxGroup
  const [selectedFruits, setSelectedFruits] = useState<Array<string | number>>(['apple', 'banana']);

  // State for IndeterminateCheckbox
  const [selectedPermissions, setSelectedPermissions] = useState<Array<string | number>>(['read']);

  // State for AdvancedCheckbox
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // State for custom icons checkbox
  const [customIconChecked, setCustomIconChecked] = useState(false);

  // State for form
  const [formValues, setFormValues] = useState({
    acceptTerms: false,
    newsletter: false,
    marketing: false,
  });

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

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(JSON.stringify({ formValues, selectedFruits, selectedPermissions }, null, 2));
  };

  // Handle form value changes
  const handleFormChange =
    (field: keyof typeof formValues) =>
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setFormValues({
        ...formValues,
        [field]: checked,
      });
    };

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <h2 className="mb-6 text-2xl font-bold">Advanced Checkbox Examples</h2>

      {/* Custom Icon Checkboxes */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Custom Icon Checkboxes</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded border p-4">
            <Checkbox
              label="Custom square icons"
              icon={<BsSquare className="text-gray-400" size={20} />}
              checkedIcon={<BsCheckSquare className="text-blue-500" size={20} />}
              indeterminateIcon={<FaMinus className="text-blue-500" size={20} />}
              onChange={(e, checked) => setCustomIconChecked(checked)}
              checked={customIconChecked}
            />
          </div>

          <div className="rounded border p-4">
            <Checkbox
              label="Circle icons"
              icon={<BsCircle className="text-gray-400" size={20} />}
              checkedIcon={<BsCheckCircle className="text-green-500" size={20} />}
              indeterminate={customIconChecked}
            />
          </div>

          <div className="rounded border p-4">
            <AdvancedCheckbox
              label="Animated checkbox with ripple"
              checkedContent={
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-500">
                  <BsCheckSquare className="h-4 w-4 text-white" />
                </div>
              }
              uncheckedContent={<div className="h-5 w-5 rounded-md border-2 border-gray-300" />}
              rippleClassName="bg-blue-200"
              onChange={(checked) => console.log('Animated checkbox:', checked)}
            />
          </div>

          <div className="rounded border p-4">
            <Checkbox
              label="Switch style"
              icon={<FiToggleLeft className="text-gray-400" size={24} />}
              checkedIcon={<FiToggleRight className="text-purple-500" size={24} />}
              color="secondary"
            />
          </div>
        </div>
      </section>

      {/* Checkbox Group */}
      <section className="space-y-4">
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
      <section className="space-y-4">
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

      {/* Form with Checkboxes */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Form with Checkboxes</h3>
        <form onSubmit={handleSubmit} className="space-y-4 rounded border p-4">
          <Checkbox
            name="acceptTerms"
            id="acceptTerms"
            label="I accept the terms and conditions"
            required
            error={!formValues.acceptTerms}
            helperText={!formValues.acceptTerms ? 'You must accept the terms to continue' : ''}
            checked={formValues.acceptTerms}
            onChange={handleFormChange('acceptTerms')}
          />

          <Checkbox
            name="newsletter"
            id="newsletter"
            label="Subscribe to newsletter"
            checked={formValues.newsletter}
            onChange={handleFormChange('newsletter')}
          />

          <Checkbox
            name="marketing"
            id="marketing"
            label="Receive marketing emails"
            checked={formValues.marketing}
            onChange={handleFormChange('marketing')}
          />

          <button
            type="submit"
            className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Submit Form
          </button>
        </form>
      </section>

      {/* Advanced Use Case */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Advanced Use Case</h3>
        <div className="rounded border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Enable Notifications</h4>
              <p className="text-sm text-gray-500">Receive alerts for important updates</p>
            </div>
            <AdvancedCheckbox
              checked={notificationsEnabled}
              onChange={(checked) => setNotificationsEnabled(checked)}
              enableRipple={true}
              rippleClassName="bg-green-100"
              rippleDuration={750}
              soundEffect={true}
              checkedContent={
                <div className="flex h-6 w-12 items-center justify-end rounded-full bg-green-500 p-1">
                  <div className="h-4 w-4 rounded-full bg-white shadow"></div>
                </div>
              }
              uncheckedContent={
                <div className="flex h-6 w-12 items-center rounded-full bg-gray-300 p-1">
                  <div className="h-4 w-4 rounded-full bg-white shadow"></div>
                </div>
              }
            />
          </div>

          <div
            className={`mt-4 rounded border p-3 ${
              notificationsEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            {notificationsEnabled
              ? 'Notifications are enabled! You will receive important alerts.'
              : 'Notifications are disabled. Enable them to stay updated.'}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdvancedCheckBoxExample;
