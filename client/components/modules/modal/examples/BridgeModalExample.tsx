import React from 'react';
import modalBridge from '../utils/ModalBridge';

/**
 * Bridge Example Component
 * Shows how to use the Modal Bridge to reduce boilerplate code
 */
const BridgeExample: React.FC = () => {
  // Toggle between light and dark themes
  const toggleTheme = () => {
    // Set theme to dark if it's currently light, otherwise set to light
    modalBridge.setTheme(document.body.classList.contains('dark-mode') ? 'light' : 'dark');

    // Toggle class on body for visual feedback (not related to the modal itself)
    document.body.classList.toggle('dark-mode');
  };

  // Simple handlers for different modal types
  const showSuccess = () => {
    modalBridge.success('Success!', 'Operation completed successfully.');
  };

  const showError = () => {
    modalBridge.error('Error', 'Something went wrong. Please try again.');
  };

  const showWarning = () => {
    modalBridge.warning('Warning', 'This action might cause unexpected results.');
  };

  const showNotification = () => {
    modalBridge.notify('This is a toast notification!', 10000000);
  };

  const showCustomConfirm = () => {
    modalBridge.customConfirm(
      'Delete Account',
      'Are you sure you want to permanently delete your account?',
      'Yes, Delete My Account',
      'Cancel',
      () => {
        console.log('Account deletion confirmed');
        // Perform deletion logic here
        setTimeout(() => {
          modalBridge.success('Account Deleted', 'Your account has been successfully deleted.');
        }, 1000);
      },
    );
  };

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Modal Bridge Examples</h1>
      <p className="text-gray-600">
        The Modal Bridge provides preset configurations to reduce boilerplate code.
      </p>

      <div className="space-y-2">
        <button onClick={toggleTheme} className="mb-4 rounded bg-gray-800 px-4 py-2 text-white">
          Toggle Theme
        </button>

        <div className="flex flex-wrap gap-3">
          <button onClick={showSuccess} className="rounded bg-green-600 px-4 py-2 text-white">
            Success Modal
          </button>

          <button onClick={showError} className="rounded bg-red-600 px-4 py-2 text-white">
            Error Modal
          </button>

          <button onClick={showWarning} className="rounded bg-yellow-600 px-4 py-2 text-white">
            Warning Modal
          </button>

          <button onClick={showNotification} className="rounded bg-blue-600 px-4 py-2 text-white">
            Toast Notification
          </button>

          <button
            onClick={showCustomConfirm}
            className="rounded bg-purple-600 px-4 py-2 text-white"
          >
            Custom Confirmation
          </button>
        </div>
      </div>

      <div className="rounded bg-gray-100 p-4">
        <h2 className="mb-2 font-medium">Benefits of Modal Bridge:</h2>
        <ul className="list-inside list-disc space-y-1">
          <li>Consistent styling across all modals</li>
          <li>Simplified API for common use cases</li>
          <li>Easy theme switching</li>
          <li>Less repetitive code</li>
        </ul>
      </div>
    </div>
  );
};

export default BridgeExample;
