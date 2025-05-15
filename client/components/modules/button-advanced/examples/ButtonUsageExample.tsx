import React, { useState, useRef } from 'react';
import { BsMailbox, BsHeart, BsDownload, BsSearch, BsSave } from 'react-icons/bs';
import SimpleButton from '../components/SimpleButton';
import IconButton from '../components/IconButton';
import LoadingButtonComponent from '../components/LoadingButton';
import AdvancedButton from '../components/AdvancedButton';
import ButtonBridge from '../components/ButtonBridge';

const ButtonUsageExamples = () => {
  // State for loading buttons
  const [loading, setLoading] = useState(false);

  // Form reference
  const formRef = useRef<HTMLFormElement>(null);

  // Loading button handler
  const handleLoadingAction = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLoadingAction();
    console.log('Form submitted!');
  };

  return (
    <div className="space-y-8 p-8">
      {/* Basic buttons section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Basic Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <SimpleButton label="Primary Button" variant="contained" color="primary" />

          <SimpleButton label="Secondary Button" variant="contained" color="secondary" />

          <SimpleButton label="Outlined Button" variant="outlined" color="primary" />

          <SimpleButton label="Text Button" variant="text" color="primary" />
        </div>
      </section>

      {/* Icon buttons section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Icon Buttons Basic Usage</h2>
        <div className="flex flex-wrap items-center gap-4">
          <IconButton label="Mail" icon={<BsMailbox />} color="primary" />

          <IconButton label="Favorite" icon={<BsHeart />} color="secondary" />

          <IconButton label="Download" icon={<BsDownload />} color="success" iconSize={28} />

          <IconButton label="Search" icon={<BsSearch />} color="info" edge="end" />
        </div>
      </section>

      {/* Loading buttons section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Loading Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <LoadingButtonComponent
            label="Submit"
            loading={loading}
            loadingPosition="start"
            onClick={handleLoadingAction}
            variant="contained"
            color="primary"
            startIcon={<BsSave />}
          />

          <LoadingButtonComponent
            label="Save Changes"
            loading={loading}
            loadingPosition="end"
            onClick={handleLoadingAction}
            variant="outlined"
            color="success"
            endIcon={<BsSave />}
          />

          <LoadingButtonComponent
            label="Processing..."
            loading={loading}
            onClick={handleLoadingAction}
            variant="contained"
            color="info"
          />
        </div>
      </section>

      {/* Advanced buttons with tooltips */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Advanced Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <AdvancedButton
            label="With Tooltip"
            tooltip="This is a helpful tooltip"
            tooltipPlacement="top"
            variant="contained"
            color="primary"
          />

          <AdvancedButton label="No Ripple" disableRipple variant="contained" color="secondary" />

          <AdvancedButton
            label="Flat Button"
            disableElevation
            variant="contained"
            color="warning"
            tooltip="A flat button with no elevation"
          />
        </div>
      </section>

      {/* Form integration */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Form Integration</h2>
        <form ref={formRef} onSubmit={handleSubmit} className="max-w-md rounded-lg border p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full rounded border p-2"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full rounded border p-2"
                required
              />
            </div>

            <div className="flex gap-2">
              <SimpleButton label="Reset" type="reset" variant="outlined" color="error" />

              <LoadingButtonComponent
                label="Submit"
                type="submit"
                loading={loading}
                variant="contained"
                color="success"
                fullWidth
              />
            </div>
          </div>
        </form>
      </section>

      {/* Using the Bridge pattern */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Dynamic Buttons (Bridge Pattern)</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Dynamic button configuration */}
          {[
            {
              type: 'simple' as const,
              props: {
                label: 'Primary Action',
                variant: 'contained' as const,
                color: 'primary' as const,
                startIcon: <BsHeart />,
                onClick: () => alert('Primary action clicked'),
              },
            },
            {
              type: 'icon' as const,
              props: {
                label: 'Action Icon',
                color: 'secondary' as const,
                icon: <BsMailbox />,
                onClick: () => alert('Icon clicked'),
              },
            },
            {
              type: 'loading' as const,
              props: {
                label: 'Process Data',
                loading,
                loadingPosition: 'start' as const,
                onClick: handleLoadingAction,
                startIcon: <BsDownload />,
                variant: 'outlined' as const,
                color: 'info' as const,
              },
            },
            {
              type: 'advanced' as const,
              props: {
                label: 'Advanced Action',
                tooltip: 'Click for advanced options',
                variant: 'contained' as const,
                color: 'warning' as const,
                onClick: () => alert('Advanced action clicked'),
              },
            },
          ].map((button, index) => (
            <div key={index} className="rounded-lg border p-4">
              <p className="mb-2 text-sm font-medium">Button Type: {button.type}</p>
              <ButtonBridge type={button.type} props={button.props} />
            </div>
          ))}
        </div>
      </section>

      {/* Responsive usage */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Responsive Buttons</h2>
        <div className="space-y-4">
          <div className="md:hidden">
            {/* Mobile only - Icon button */}
            <IconButton label="Search (Mobile)" icon={<BsSearch />} color="primary" size="large" />
          </div>

          <div className="hidden md:block">
            {/* Desktop only - Full button */}
            <SimpleButton
              label="Search"
              startIcon={<BsSearch />}
              variant="contained"
              color="primary"
            />
          </div>

          {/* Full width on mobile, normal on desktop */}
          <SimpleButton
            label="Responsive Width"
            variant="contained"
            color="secondary"
            fullWidth
            className="md:w-auto"
          />
        </div>
      </section>

      {/* Additional capabilities */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Advanced Capabilities</h2>
        <div className="space-y-4">
          {/* Custom component */}
          <SimpleButton
            label="Link Button"
            variant="contained"
            color="primary"
            component="a"
            href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
          />

          {/* Custom styling */}
          <SimpleButton
            label="Custom Styled"
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '25px',
            }}
          />

          {/* With form ID */}
          <SimpleButton
            label="External Submit"
            variant="contained"
            color="success"
            type="submit"
            form="externalForm"
          />

          <form
            id="externalForm"
            onSubmit={(e) => {
              e.preventDefault();
              alert('External form submitted!');
            }}
            className="hidden"
          >
            <input type="hidden" name="external" value="true" />
          </form>
        </div>
      </section>
    </div>
  );
};

export default ButtonUsageExamples;
