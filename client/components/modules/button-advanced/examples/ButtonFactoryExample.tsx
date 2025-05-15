import React, { useState } from 'react';
import { BsHeart, BsSave, BsTrash, BsLink, BsArrowLeft } from 'react-icons/bs';
import ButtonBridge from '../components/ButtonBridge';
import { ButtonFactory } from '../utils/ButtonFactory';

const FactoryExample = () => {
  const [loading, setLoading] = useState(false);

  const handleLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLoading();
    console.log('Form submitted via factory pattern');
  };

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-2xl font-bold">ButtonFactory Usage Examples</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Buttons</h2>
        <div className="flex flex-wrap gap-4">
          {/* Simple button using factory */}
          <ButtonBridge
            {...ButtonFactory.createSimple('Like', {
              startIcon: <BsHeart />,
              color: 'primary',
              variant: 'contained',
            })}
          />

          {/* Icon button using factory */}
          <ButtonBridge
            {...ButtonFactory.createIcon('Favorite', <BsHeart />, {
              color: 'secondary',
            })}
          />

          {/* Loading button using factory */}
          <ButtonBridge
            {...ButtonFactory.createLoading('Save', loading, {
              loadingPosition: 'start',
              startIcon: <BsSave />,
              onClick: handleLoading,
              color: 'success',
            })}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Forms and Links</h2>

        <form onSubmit={handleFormSubmit} className="max-w-md rounded-lg border p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <input type="email" id="email" className="w-full rounded border p-2" required />
            </div>

            <div className="flex gap-2">
              {/* Reset button using factory */}
              <ButtonBridge {...ButtonFactory.createReset()} />

              {/* Submit button using factory */}
              <ButtonBridge
                {...ButtonFactory.createSubmit('Save Changes', {
                  loading,
                  startIcon: <BsSave />,
                  loadingPosition: 'start',
                })}
              />
            </div>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-4">
          {/* Link button using factory */}
          <ButtonBridge
            {...ButtonFactory.createLink('Documentation', 'https://example.com', {
              startIcon: <BsLink />,
              variant: 'outlined',
            })}
          />

          {/* Back button */}
          <ButtonBridge
            {...ButtonFactory.createSimple('Back', {
              startIcon: <BsArrowLeft />,
              variant: 'text',
              onClick: () => window.history.back(),
            })}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Danger and Confirmation</h2>
        <div className="flex flex-wrap gap-4">
          {/* Danger button using factory */}
          <ButtonBridge
            {...ButtonFactory.createDanger('Delete Account', {
              startIcon: <BsTrash />,
              onClick: () => confirm('Are you sure you want to delete your account?'),
            })}
          />

          {/* Confirmation button using factory */}
          <ButtonBridge
            {...ButtonFactory.createConfirm('Publish', 'Are you sure you want to publish?', {
              color: 'success',
              variant: 'contained',
              onClick: () => {
                if (confirm('Confirm publication?')) {
                  alert('Published!');
                }
              },
            })}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Advanced Usage</h2>
        <div className="flex flex-wrap gap-4">
          {/* Advanced button with tooltip */}
          <ButtonBridge
            {...ButtonFactory.createAdvanced(
              'Upgrade Plan',
              'Upgrade to Premium for more features',
              {
                variant: 'contained',
                color: 'warning',
                onClick: () => alert('Upgrade initiated'),
              },
            )}
          />

          {/* Custom styled button */}
          <ButtonBridge
            {...ButtonFactory.createSimple('Custom Style', {
              sx: {
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                borderRadius: '25px',
                color: 'white',
                padding: '0 30px',
              },
            })}
          />
        </div>
      </section>
    </div>
  );
};

export default FactoryExample;
