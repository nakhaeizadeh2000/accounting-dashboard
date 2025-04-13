import React from 'react';
import { BsSave, BsTrash, BsCloudUpload } from 'react-icons/bs';
import { useConfirmButton, useFormButtons, useLoadingButton, useSubmitButton } from './useButton';
import ButtonBridge from './ButtonBridge';

const HooksExample = () => {
  // Simple loading button with auto-managed state
  const saveButton = useLoadingButton('Save', {
    startIcon: <BsSave />,
    color: 'success',
    variant: 'contained'
  }, 2000); // 2 second loading duration
  
  // Submit button for forms
  const submitButton = useSubmitButton('Submit Form', {
    startIcon: <BsCloudUpload />
  });
  
  // Button with confirmation dialog
  const deleteButton = useConfirmButton(
    'Delete Item',
    'Are you sure you want to delete this item?',
    () => console.log('Item deleted!'),
    {
      startIcon: <BsTrash />,
      color: 'error',
      variant: 'outlined'
    }
  );
  
  // Form buttons (submit + reset)
  const formButtons = useFormButtons(
    'Save Changes',
    'Cancel',
    { startIcon: <BsSave /> }
  );
  
  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // This will automatically set loading state
    await submitButton.handleClick(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Form submitted!');
    });
  };
  
  // Example of a complex action with loading state
  const handleSaveWithValidation = async () => {
    // This will automatically set loading state
    await saveButton.handleClick(async () => {
      // Simulate validation and saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Data saved successfully!');
    });
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Button Hooks Examples</h1>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Loading Button Hook</h2>
        <p className="text-gray-600">This button manages its own loading state automatically</p>
        
        <div className="flex gap-4">
          <ButtonBridge {...saveButton.buttonProps} />
          
          <button 
            onClick={handleSaveWithValidation} 
            className="px-4 py-2 bg-blue-500 text-white rounded"
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
        
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg max-w-md">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
              <input 
                type="text" 
                id="name" 
                className="w-full p-2 border rounded" 
                required 
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input 
                type="email" 
                id="email" 
                className="w-full p-2 border rounded" 
                required 
              />
            </div>
            
            <div className="flex gap-2">
              <ButtonBridge {...submitButton.buttonProps} />
            </div>
          </div>
        </form>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Confirmation Button</h2>
        <p className="text-gray-600">This button shows a confirmation dialog before executing the action</p>
        
        <ButtonBridge {...deleteButton.buttonProps} />
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Form Button Pair</h2>
        <p className="text-gray-600">This hook creates both submit and reset buttons for forms</p>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            formButtons.handleClick(async () => {
              await new Promise(resolve => setTimeout(resolve, 1500));
              console.log('Form with button pair submitted!');
            });
          }} 
          className="p-4 border rounded-lg max-w-md"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
              <textarea 
                id="message" 
                className="w-full p-2 border rounded" 
                rows={3}
              />
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