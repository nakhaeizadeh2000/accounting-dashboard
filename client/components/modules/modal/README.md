# React Modal System

A comprehensive, flexible, and future-proof modal system for React applications built on top of SweetAlert2. This system follows SOLID principles, clean code practices, and modern React patterns.

![Modal System Architecture](https://via.placeholder.com/800x400?text=Modal+System+Architecture)

## Table of Contents

- [React Modal System](#react-modal-system)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Architecture](#architecture)
    - [Architecture Diagram](#architecture-diagram)
  - [Usage Examples](#usage-examples)
    - [Basic Modals](#basic-modals)
    - [Component Modals](#component-modals)
    - [Modal Bridge](#modal-bridge)
    - [Hooks API](#hooks-api)
  - [Advanced Usage](#advanced-usage)
    - [Form Handling](#form-handling)
    - [Multi-step Wizards](#multi-step-wizards)
    - [Dynamic Components](#dynamic-components)
    - [State Management](#state-management)
  - [API Reference](#api-reference)
    - [ModalService](#modalservice)
    - [useModal Hook](#usemodal-hook)
    - [ModalBridge](#modalbridge)
  - [Performance Optimization](#performance-optimization)
    - [Code Splitting](#code-splitting)
  - [Accessibility](#accessibility)
    - [Keyboard Navigation](#keyboard-navigation)
  - [Future Roadmap](#future-roadmap)
    - [Planned Features](#planned-features)
    - [Version 2.0 Plans](#version-20-plans)
  - [Troubleshooting](#troubleshooting)
    - [Common Issues](#common-issues)
    - [TypeScript Errors](#typescript-errors)
    - [React 18 Compatibility](#react-18-compatibility)
  - [License](#license)

## Features

- **Component-based** - Render any React component in modals
- **Type-safe** - Comprehensive TypeScript definitions
- **SOLID principles** - Clean architecture following best practices
- **Bridge pattern** - Simplified API for common use cases
- **React 18+ compatible** - Uses modern React features and patterns
- **Customizable** - Easily style and extend functionality
- **Performance optimized** - Uses memoization and proper cleanup
- **Accessibility focused** - ARIA support and keyboard navigation

## Installation

1. Copy the modal system files to your project:

```bash
src/
├── components/
│   └── Modal/
│       ├── hooks/
│       │   └── useModal.ts
│       ├── ComponentModalButton.tsx
│       ├── ComponentRenderer.tsx
│       ├── index.ts
│       ├── ModalBridge.ts
│       ├── ModalButton.tsx
│       ├── ModalService.ts
│       └── types.ts
```

2. Install dependencies:

```bash
npm install sweetalert2
# or
yarn add sweetalert2
```

## Architecture

The modal system follows a layered architecture with clear separation of concerns:

| Layer     | Components                        | Responsibility                                       |
| --------- | --------------------------------- | ---------------------------------------------------- |
| UI        | ModalButton, ComponentModalButton | User interface components for triggering modals      |
| Service   | ModalService, ModalBridge         | Core business logic for creating and managing modals |
| Utilities | ComponentRenderer                 | Helper functions for rendering React components      |
| Hooks     | useModal                          | React hooks for using modals in function components  |
| Types     | types.ts                          | TypeScript type definitions                          |

### Architecture Diagram

```
+-------------------+      +-------------------+
|                   |      |                   |
|    ModalButton    |      | ComponentModalBtn |
|                   |      |                   |
+--------+----------+      +---------+---------+
         |                           |
         |                           |
         v                           v
+-------------------------------------------+
|                                           |
|               ModalService                |
|                                           |
+-----+-------------------------+-----------+
      |                         |
      |                         |
      v                         v
+-------------+        +------------------+
|             |        |                  |
| ModalBridge |        | ComponentRenderer|
|             |        |                  |
+-------------+        +------------------+
      ^
      |
      |
+-----+------+
|            |
|  useModal  |
|            |
+------------+
```

## Usage Examples

### Basic Modals

```tsx
import { modalService } from './components/Modal';

// Simple alert
modalService.alert('Information', 'This is a simple alert message');

// Confirmation dialog
modalService.confirm('Confirm Action', 'Are you sure you want to proceed?', (result) => {
  if (result.isConfirmed) {
    console.log('User confirmed the action');
    // Perform action here
  }
});

// Custom modal
modalService.show({
  title: 'Custom Modal',
  text: 'This is a custom modal with additional options',
  icon: 'success',
  showCancelButton: true,
  confirmButtonText: 'Yes, proceed!',
  cancelButtonText: 'Cancel',
  customClass: {
    container: 'my-custom-container',
    popup: 'my-custom-popup',
  },
});
```

### Component Modals

```tsx
import { modalService } from './components/Modal';
import UserForm from './components/UserForm';

// Render a form component in a modal
const handleFormSubmit = (data) => {
  console.log('Form data:', data);
};

modalService.showComponent({
  title: 'User Registration',
  component: <UserForm onSubmit={handleFormSubmit} />,
  width: '600px',
  showConfirmButton: false,
});

// Using the ComponentModalButton
import { ComponentModalButton } from './components/Modal';

function App() {
  return (
    <ComponentModalButton
      options={{
        title: 'Contact Form',
        component: <ContactForm />,
        width: '500px',
      }}
      buttonText="Open Contact Form"
      className="rounded bg-blue-500 px-4 py-2 text-white"
    />
  );
}
```

### Modal Bridge

```tsx
import modalBridge from './components/Modal/ModalBridge';

// Set global theme
modalBridge.setTheme('dark');

// Show success message
modalBridge.success('Success!', 'Operation completed successfully');

// Show error message
modalBridge.error('Error', 'Something went wrong');

// Show a notification that automatically closes
modalBridge.notify('New message received', 3000);

// Custom confirmation dialog
modalBridge.customConfirm(
  'Delete Account',
  'This action cannot be undone. Are you sure?',
  'Yes, Delete',
  'Cancel',
  () => {
    console.log('User confirmed deletion');
    // Perform deletion logic
  },
);
```

### Hooks API

```tsx
import { useModal } from './components/Modal';
import DataForm from './components/DataForm';

function MyComponent() {
  const { openModal, openComponentModal, closeModal, confirmModal, alertModal, isOpen } =
    useModal();

  const handleOpenForm = () => {
    openComponentModal({
      title: 'Enter Information',
      component: (
        <DataForm
          onSubmit={(data) => {
            console.log('Form data:', data);
            closeModal();
          }}
        />
      ),
      showConfirmButton: false,
    });
  };

  const handleDeleteItem = () => {
    confirmModal('Delete Item', 'Are you sure you want to delete this item?', (result) => {
      if (result.isConfirmed) {
        console.log('Item deleted');
        // Perform deletion
      }
    });
  };

  return (
    <div>
      <button type="button" onClick={handleOpenForm}>
        Open Form
      </button>
      <button type="button" onClick={handleDeleteItem}>
        Delete Item
      </button>
      {isOpen && <p>A modal is currently open</p>}
    </div>
  );
}
```

## Advanced Usage

### Form Handling

```tsx
import { FC, useState } from 'react';
import { useModal } from '../components/Modal';

interface FormData {
  name: string;
  email: string;
  comments: string;
}

const FormExample: FC = () => {
  const { openComponentModal, closeModal } = useModal();
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  const handleOpenForm = () => {
    openComponentModal({
      title: 'Contact Form',
      component: (
        <ContactForm
          onSubmit={(data) => {
            setSubmittedData(data);
            closeModal();
          }}
        />
      ),
      showConfirmButton: false,
      width: '600px',
    });
  };

  return (
    <div className="p-4">
      <button
        type="button"
        onClick={handleOpenForm}
        className="rounded bg-blue-500 px-4 py-2 text-white"
      >
        Open Contact Form
      </button>

      {submittedData && (
        <div className="mt-4 rounded bg-gray-100 p-4">
          <h3 className="font-medium">Submitted Data:</h3>
          <p>
            <strong>Name:</strong> {submittedData.name}
          </p>
          <p>
            <strong>Email:</strong> {submittedData.email}
          </p>
          <p>
            <strong>Comments:</strong> {submittedData.comments}
          </p>
        </div>
      )}
    </div>
  );
};

// Contact form component
interface ContactFormProps {
  onSubmit: (data: FormData) => void;
}

const ContactForm: FC<ContactFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    comments: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border p-2"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border p-2"
          required
        />
      </div>

      <div>
        <label htmlFor="comments" className="block text-sm font-medium">
          Comments
        </label>
        <textarea
          id="comments"
          name="comments"
          value={formData.comments}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border p-2"
          rows={4}
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600"
      >
        Submit
      </button>
    </form>
  );
};
```

### Multi-step Wizards

```tsx
import { FC, useState } from 'react';
import { useModal } from '../components/Modal';

// Example of a multi-step wizard in a modal
const WizardExample: FC = () => {
  const { openComponentModal } = useModal();

  const handleOpenWizard = () => {
    openComponentModal({
      title: 'Setup Wizard',
      component: <WizardComponent />,
      width: '700px',
      showConfirmButton: false,
      showCancelButton: false,
    });
  };

  return (
    <button
      type="button"
      onClick={handleOpenWizard}
      className="rounded bg-purple-600 px-4 py-2 text-white"
    >
      Open Setup Wizard
    </button>
  );
};

// Multi-step wizard component
const WizardComponent: FC = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    name: '',
    email: '',
    preferences: {
      theme: 'light',
      notifications: true,
    },
    complete: false,
  });

  const updateData = (newData: Partial<typeof data>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleComplete = () => {
    updateData({ complete: true });
    console.log('Wizard completed with data:', data);
    // You could close the modal here or show a success message
  };

  return (
    <div className="p-4">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step >= stepNumber ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {stepNumber}
            </div>
          ))}
        </div>
        <div className="relative mt-2 h-1 bg-gray-200">
          <div
            className="absolute left-0 top-0 h-1 bg-blue-500"
            style={{ width: `${(step - 1) * 33.33}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="mb-6">
        {step === 1 && (
          <div>
            <h3 className="mb-4 text-lg font-medium">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => updateData({ name: e.target.value })}
                  className="mt-1 block w-full rounded-md border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => updateData({ email: e.target.value })}
                  className="mt-1 block w-full rounded-md border p-2"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="mb-4 text-lg font-medium">Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Theme</label>
                <select
                  value={data.preferences.theme}
                  onChange={(e) =>
                    updateData({
                      preferences: {
                        ...data.preferences,
                        theme: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border p-2"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={data.preferences.notifications}
                  onChange={(e) =>
                    updateData({
                      preferences: {
                        ...data.preferences,
                        notifications: e.target.checked,
                      },
                    })
                  }
                  className="mr-2"
                />
                <label htmlFor="notifications">Enable notifications</label>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="mb-4 text-lg font-medium">Review</h3>
            <div className="space-y-4 rounded bg-gray-50 p-4">
              <div>
                <h4 className="font-medium">Personal Information</h4>
                <p>
                  <strong>Name:</strong> {data.name}
                </p>
                <p>
                  <strong>Email:</strong> {data.email}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Preferences</h4>
                <p>
                  <strong>Theme:</strong> {data.preferences.theme}
                </p>
                <p>
                  <strong>Notifications:</strong>{' '}
                  {data.preferences.notifications ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium">Setup Complete!</h3>
            <p className="mt-2 text-gray-600">
              Thank you for completing the setup wizard. Your preferences have been saved.
            </p>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className={`rounded border px-4 py-2 ${step === 1 ? 'invisible' : ''}`}
        >
          Previous
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={nextStep}
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            {step === 3 ? 'Finish' : 'Next'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            className="rounded bg-green-500 px-4 py-2 text-white"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};
```

### Dynamic Components

```tsx
const DynamicComponentExample: FC = () => {
  const { openComponentModal } = useModal();
  const [component, setComponent] = useState<string>('form');

  const loadComponent = (type: string) => {
    setComponent(type);

    let modalComponent;
    let title;
    let width = '500px';

    switch (type) {
      case 'form':
        modalComponent = <UserForm onSubmit={(data) => console.log(data)} />;
        title = 'User Form';
        break;
      case 'chart':
        modalComponent = <ChartComponent />;
        title = 'Data Visualization';
        width = '800px';
        break;
      case 'video':
        modalComponent = <VideoPlayer url="https://example.com/video.mp4" />;
        title = 'Video Player';
        width = '720px';
        break;
      case 'map':
        modalComponent = <MapComponent />;
        title = 'Location Map';
        width = '800px';
        break;
      default:
        modalComponent = <div>Unknown component type</div>;
        title = 'Error';
    }

    openComponentModal({
      title,
      component: modalComponent,
      width,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Dynamic Component Loading</h2>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => loadComponent('form')}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          Load Form
        </button>

        <button
          type="button"
          onClick={() => loadComponent('chart')}
          className="rounded bg-green-500 px-4 py-2 text-white"
        >
          Load Chart
        </button>

        <button
          type="button"
          onClick={() => loadComponent('video')}
          className="rounded bg-red-500 px-4 py-2 text-white"
        >
          Load Video
        </button>

        <button
          type="button"
          onClick={() => loadComponent('map')}
          className="rounded bg-purple-500 px-4 py-2 text-white"
        >
          Load Map
        </button>
      </div>
    </div>
  );
};
```

### State Management

The modal system can work with any state management solution:

```tsx
// Using React Context
import { createContext, useContext, useState, FC, ReactNode } from 'react';
import { useModal } from '../components/Modal';

// Create context
interface ModalContextType {
  openUserForm: () => void;
  openSettings: () => void;
  openConfirmation: (message: string, onConfirm: () => void) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Provider component
interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: FC<ModalProviderProps> = ({ children }) => {
  const { openComponentModal, confirmModal } = useModal();

  const openUserForm = () => {
    openComponentModal({
      title: 'User Form',
      component: <UserForm />,
      width: '500px',
    });
  };

  const openSettings = () => {
    openComponentModal({
      title: 'Settings',
      component: <SettingsPanel />,
      width: '600px',
    });
  };

  const openConfirmation = (message: string, onConfirm: () => void) => {
    confirmModal('Confirmation', message, (result) => {
      if (result.isConfirmed) {
        onConfirm();
      }
    });
  };

  return (
    <ModalContext.Provider
      value={{
        openUserForm,
        openSettings,
        openConfirmation,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

// Custom hook to use the modal context
export const useModalContext = () => {
  const context = useContext(ModalContext);

  if (context === undefined) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }

  return context;
};

// Usage in components
const SettingsButton: FC = () => {
  const { openSettings } = useModalContext();

  return (
    <button type="button" onClick={openSettings} className="rounded bg-gray-200 px-4 py-2">
      Settings
    </button>
  );
};
```

## API Reference

### ModalService

| Method          | Description                            | Parameters                                                  |
| --------------- | -------------------------------------- | ----------------------------------------------------------- |
| `show`          | Display a modal with options           | `options: ModalOptions`                                     |
| `showComponent` | Display a modal with a React component | `options: ComponentModalOptions`                            |
| `close`         | Close any active modal                 | None                                                        |
| `confirm`       | Show a confirmation dialog             | `title: string, text: string, onConfirm?: (result) => void` |
| `alert`         | Show an alert dialog                   | `title: string, text: string`                               |

### useModal Hook

| Method               | Description                           | Parameters                                                  |
| -------------------- | ------------------------------------- | ----------------------------------------------------------- |
| `openModal`          | Open a modal with options             | `options: ModalOptions`                                     |
| `openComponentModal` | Open a modal with a React component   | `options: ComponentModalOptions`                            |
| `closeModal`         | Close the current modal               | None                                                        |
| `confirmModal`       | Open a confirmation dialog            | `title: string, text: string, onConfirm?: (result) => void` |
| `alertModal`         | Open an alert dialog                  | `title: string, text: string`                               |
| `isOpen`             | Boolean indicating if a modal is open | N/A (State)                                                 |

### ModalBridge

| Method          | Description                           | Parameters                                                                                          |
| --------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `setTheme`      | Set the global theme for modals       | `theme: 'light' \| 'dark'`                                                                          |
| `createOptions` | Create options with theme applied     | `options: SweetAlertOptions`                                                                        |
| `success`       | Show a success message                | `title: string, message?: string`                                                                   |
| `error`         | Show an error message                 | `title: string, message?: string`                                                                   |
| `warning`       | Show a warning message                | `title: string, message?: string`                                                                   |
| `customConfirm` | Show a customized confirmation dialog | `title: string, message: string, confirmText?: string, cancelText?: string, onConfirm?: () => void` |
| `notify`        | Show a notification that auto-closes  | `message: string, duration?: number`                                                                |

## Performance Optimization

The modal system includes several performance optimizations:

1. **Memoization** - Uses `useCallback` to prevent unnecessary re-renders
2. **Lazy initialization** - Only creates modal instances when needed
3. **Proper cleanup** - Ensures all resources are released when modals close
4. **Singleton pattern** - Prevents multiple instances of the service
5. **Component reuse** - Efficiently manages component lifecycle

### Code Splitting

For applications with many modal components, consider using code splitting:

```tsx
import { lazy, Suspense } from 'react';
import { modalService } from './components/Modal';

// Lazy load component
const LazyFormComponent = lazy(() => import('./components/LazyForm'));

const openLazyComponent = () => {
  modalService.showComponent({
    title: 'Lazy Loaded Component',
    component: (
      <Suspense fallback={<div>Loading...</div>}>
        <LazyFormComponent />
      </Suspense>
    ),
    width: '500px',
  });
};
```

## Accessibility

The modal system includes several accessibility enhancements:

- Proper focus management
- ARIA attributes for screen readers
- Keyboard navigation
- Proper button types
- Color contrast considerations

### Keyboard Navigation

- `Esc` - Close the modal
- `Tab` - Navigate between focusable elements
- `Enter` - Activate the focused element
- `Space` - Activate buttons

## Future Roadmap

### Planned Features

- [ ] Animation customization
- [ ] Theme system with CSS variables
- [ ] More built-in component templates
- [ ] Integration with popular form libraries (React Hook Form, Formik)
- [ ] Advanced accessibility features
- [ ] Server-side rendering support
- [ ] Testing utilities
- [ ] Mobile-optimized variants

### Version 2.0 Plans

1. **Context API Integration** - Global modal state management
2. **Custom Animation System** - Built-in transitions and effects
3. **Headless Mode** - Full control over markup and styling
4. **Plugin System** - Extend functionality with plugins
5. **Framework Agnostic Core** - Support for other frameworks

## Troubleshooting

### Common Issues

| Issue                           | Solution                                                  |
| ------------------------------- | --------------------------------------------------------- |
| Modal doesn't render components | Check that ComponentRenderer is properly imported         |
| Type errors with SweetAlert2    | Ensure you're using the correct type intersection pattern |
| React 18 warnings               | Make sure you're using createRoot instead of render       |
| Multiple modals appearing       | Check for multiple service instances                      |
| Styling conflicts               | Use the customClass option to override default styles     |

### TypeScript Errors

If you encounter TypeScript errors with SweetAlert2 options, use the type intersection pattern:

```typescript
// Instead of this (causes errors)
interface ModalOptions extends SweetAlertOptions {
  // Additional properties
}

// Use this (works correctly)
type ModalOptions = SweetAlertOptions & {
  // Additional properties
};
```

### React 18 Compatibility

For React 18, ensure you're using createRoot:

```typescript
// Correct for React 18+
import { createRoot } from 'react-dom/client';

const render = (component, container) => {
  const root = createRoot(container);
  root.render(component);
  return () => root.unmount();
};
```

## License

MIT

---

This modal system is designed to be a complete solution for modals in React applications. It follows best practices, SOLID principles, and is built with future-proofing in mind.

For questions or support, please open an issue on the repository.
