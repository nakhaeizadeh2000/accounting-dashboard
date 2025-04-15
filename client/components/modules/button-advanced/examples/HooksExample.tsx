import React from 'react';
import { BsSave, BsTrash, BsCloudUpload } from 'react-icons/bs';
import {
  useConfirmButton,
  useFormButtons,
  useLoadingButton,
  useSubmitButton,
} from '../hooks/useButton';
import ButtonBridge from '../components/ButtonBridge';

const HooksExample = () => {
  // Simple loading button with auto-managed state
  const saveButton = useLoadingButton(
    'Save',
    {
      startIcon: <BsSave />,
      color: 'success',
      variant: 'contained',
    },
    2000,
  ); // 2 second loading duration

  // Submit button for forms
  const submitButton = useSubmitButton('Submit Form', {
    startIcon: <BsCloudUpload />,
  });

  // Button with confirmation dialog
  const deleteButton = useConfirmButton(
    'Delete Item',
    'Are you sure you want to delete this item?',
    () => console.log('Item deleted!'),
    {
      startIcon: <BsTrash />,
      color: 'error',
      variant: 'outlined',
    },
  );

  // Form buttons (submit + reset)
  const formButtons = useFormButtons('Save Changes', 'Cancel', { startIcon: <BsSave /> });

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // This will automatically set loading state
    await submitButton.handleClick(async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Form submitted!');
    });
  };

  // Example of a complex action with loading state
  const handleSaveWithValidation = async () => {
    // This will automatically set loading state
    await saveButton.handleClick(async () => {
      // Simulate validation and saving
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Data saved successfully!');
    });
  };

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-2xl font-bold">Button Hooks Examples</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Loading Button Hook</h2>
        <p className="text-gray-600">This button manages its own loading state automatically</p>

        <div className="flex gap-4">
          <ButtonBridge {...saveButton.buttonProps} />

          <button
            onClick={handleSaveWithValidation}
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Trigger Save
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Current loading state: {saveButton.loading ? 'Loading...' : 'Idle'}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Form with Hooks</h2>

        <form onSubmit={handleSubmit} className="max-w-md rounded-lg border p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Name
              </label>
              <input type="text" id="name" className="w-full rounded border p-2" required />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <input type="email" id="email" className="w-full rounded border p-2" required />
            </div>

            <div className="flex gap-2">
              <ButtonBridge {...submitButton.buttonProps} />
            </div>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Confirmation Button</h2>
        <p className="text-gray-600">
          This button shows a confirmation dialog before executing the action
        </p>

        <ButtonBridge {...deleteButton.buttonProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Form Button Pair</h2>
        <p className="text-gray-600">This hook creates both submit and reset buttons for forms</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            formButtons.handleClick(async () => {
              await new Promise((resolve) => setTimeout(resolve, 1500));
              console.log('Form with button pair submitted!');
            });
          }}
          className="max-w-md rounded-lg border p-4"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="message" className="mb-1 block text-sm font-medium">
                Message
              </label>
              <textarea id="message" className="w-full rounded border p-2" rows={3} />
            </div>

            <div className="flex gap-2">
              <ButtonBridge {...formButtons.resetButtonProps} />
              <ButtonBridge {...formButtons.submitButtonProps} />
            </div>
          </div>
        </form>
      </section>
    </div>
  );
};

export default HooksExample;
