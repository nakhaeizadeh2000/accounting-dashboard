import { BsMailbox, BsHeart, BsDownload } from 'react-icons/bs';
import { useState } from 'react';
import { ButtonType, IconButtonProps, LoadingButtonProps, SimpleButtonProps } from '../types/ButtonTypes';
import ButtonBridge from '../components/Button';


const AdvancedButtonExample = () => {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  // Define a set of buttons with different configurations
  const buttons = [
    {
      type: 'simple' as ButtonType,
      props: {
        label: 'Primary Button',
        variant: 'contained' as const,
        color: 'primary' as const,
        startIcon: <BsHeart />,
      } as SimpleButtonProps
    },
    {
      type: 'icon' as ButtonType,
      props: {
        label: 'Mail Button',
        color: 'secondary' as const,
        icon: <BsMailbox />,
      } as IconButtonProps
    },
    {
      type: 'loading' as ButtonType,
      props: {
        label: 'Download',
        loading,
        loadingPosition: 'start' as const,
        onClick: handleSubmit,
        startIcon: <BsDownload />,
        variant: 'outlined' as const,
        color: 'info' as const,
      } as LoadingButtonProps
    }
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-xl font-bold mb-4">Dynamic Buttons</h2>
      
      {buttons.map((button, index) => (
        <div key={index} className="mb-2">
          <ButtonBridge type={button.type} props={button.props} />
        </div>
      ))}
      
      {/* Form example */}
      <form 
        className="border p-4 rounded mt-4" 
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="mb-4">
          <input 
            type="text" 
            placeholder="Enter your name" 
            className="w-full p-2 border rounded" 
          />
        </div>
        
        <ButtonBridge 
          type="loading" 
          props={{
            label: "Submit Form",
            loading,
            variant: "contained" as const,
            color: "success" as const,
            onClick: handleSubmit,
          } as LoadingButtonProps} 
        />
      </form>
    </div>
  );
};

export default AdvancedButtonExample;