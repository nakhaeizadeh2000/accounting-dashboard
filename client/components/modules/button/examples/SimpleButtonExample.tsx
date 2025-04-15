import { BsMailbox } from 'react-icons/bs';
import { useState } from 'react';
import SimpleButton from '../components/SimpleButton';
import LoadingButtonComponent from '../components/LoadingButton';
import IconButtonComponent from '../components/IconButton';

const SimpleButtonExample = () => {
  const [loading, setLoading] = useState(false);
  
  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <SimpleButton 
        label="Click Me" 
        onClick={() => alert('Clicked!')} 
        variant="contained" 
        color="primary" 
      />
      
      <IconButtonComponent 
        label="Mail" 
        icon={<BsMailbox />} 
        color="secondary" 
      />
      
      <LoadingButtonComponent 
        label="Submit" 
        loading={loading} 
        loadingPosition="start" 
        onClick={handleClick} 
        variant="outlined" 
        color="success" 
      />
    </div>
  );
};

export default SimpleButtonExample;