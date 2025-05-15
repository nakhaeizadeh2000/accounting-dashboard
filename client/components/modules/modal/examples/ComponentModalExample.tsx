import { useState, FC, FormEvent, ChangeEvent } from 'react';
import useModal from '../hooks/useModal';
import ComponentModalButton from '../components/ComponentModalBtn';

// Define types
interface UserData {
  name: string;
  email: string;
}

interface UserFormProps {
  onSubmit: (data: UserData) => void;
  initialData?: UserData;
}

// Example form component to render inside a modal
const UserForm: FC<UserFormProps> = ({ onSubmit, initialData = { name: '', email: '' } }) => {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-2">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
          required
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

// Example component with tabs
const TabContent: FC = () => {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <div className="p-2">
      <div className="mb-4 flex border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'tab1' ? 'border-b-2 border-blue-500 text-blue-600' : ''}`}
          onClick={() => setActiveTab('tab1')}
          type="button"
        >
          Tab 1
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'tab2' ? 'border-b-2 border-blue-500 text-blue-600' : ''}`}
          onClick={() => setActiveTab('tab2')}
          type="button"
        >
          Tab 2
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'tab3' ? 'border-b-2 border-blue-500 text-blue-600' : ''}`}
          onClick={() => setActiveTab('tab3')}
          type="button"
        >
          Tab 3
        </button>
      </div>

      {activeTab === 'tab1' && (
        <div>
          <h3 className="font-medium">Tab 1 Content</h3>
          <p>This is the content for Tab 1. It can include any React components.</p>
        </div>
      )}

      {activeTab === 'tab2' && (
        <div>
          <h3 className="font-medium">Tab 2 Content</h3>
          <p>This is the content for Tab 2. You can include forms, lists, or other components.</p>
          <ul className="mt-2 list-inside list-disc">
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </div>
      )}

      {activeTab === 'tab3' && (
        <div>
          <h3 className="font-medium">Tab 3 Content</h3>
          <p>This is the content for Tab 3.</p>
          <div className="mt-2 rounded bg-gray-100 p-2">
            <code>const example = This can be anything you want;</code>
          </div>
        </div>
      )}
    </div>
  );
};

// Example chart component
export const SimpleChart: FC = () => {
  return (
    <div className="p-4">
      <h3 className="mb-4 text-lg font-semibold">Sample Chart</h3>
      <div className="flex h-64 items-center justify-center rounded bg-gray-100">
        {/* This is a placeholder for a real chart component */}
        <div className="text-center">
          <p>Chart placeholder</p>
          <p className="text-sm text-gray-500">
            In a real application, you would render a chart library component here
          </p>
        </div>
      </div>
    </div>
  );
};

// Main example component
const ComponentModalExample: FC = () => {
  const { openComponentModal, closeModal } = useModal();
  const [userData, setUserData] = useState<UserData | null>(null);

  // Handle form submission from the modal
  const handleFormSubmit = (data: UserData) => {
    setUserData(data);
    closeModal();
  };

  // Open form modal with hook
  const openFormModal = () => {
    openComponentModal({
      title: 'User Registration Form',
      component: <UserForm onSubmit={handleFormSubmit} />,
      showConfirmButton: false,
    });
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Component Modal Examples</h1>

      <div className="space-y-2">
        <h2 className="text-xl">Using Hooks</h2>
        <button
          type="button"
          onClick={openFormModal}
          className="rounded bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
        >
          Open Form Modal (Hook)
        </button>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl">Using Component Buttons</h2>

        <div className="flex flex-wrap gap-3">
          {/* Form component in modal */}
          <ComponentModalButton
            options={{
              title: 'User Registration',
              component: <UserForm onSubmit={handleFormSubmit} />,
              showConfirmButton: false,
            }}
            buttonText="Form Component"
            className="rounded bg-green-600 px-4 py-2 text-white shadow"
          />

          {/* Tabs component in modal */}
          <ComponentModalButton
            options={{
              title: 'Tabbed Content',
              component: <TabContent />,
              width: '600px',
            }}
            buttonText="Tabs Component"
            className="rounded bg-purple-600 px-4 py-2 text-white shadow"
          />

          {/* Chart component in modal */}
          <ComponentModalButton
            options={{
              title: 'Data Visualization',
              component: <SimpleChart />,
              width: '700px',
            }}
            buttonText="Chart Component"
            className="rounded bg-amber-600 px-4 py-2 text-white shadow"
          />
        </div>
      </div>

      {userData && (
        <div className="mt-6 rounded bg-gray-100 p-4">
          <h3 className="font-medium">Submitted User Data:</h3>
          <p>
            <strong>Name:</strong> {userData.name}
          </p>
          <p>
            <strong>Email:</strong> {userData.email}
          </p>
          <button
            type="button"
            onClick={() => setUserData(null)}
            className="mt-2 rounded bg-gray-500 px-3 py-1 text-sm text-white"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default ComponentModalExample;

// Example component with tabs
// const TabContent: FC = () => {
//   const [activeTab, setActiveTab] = useState('tab1');

//   return (
//     <div className="p-2">
//       <div className="mb-4 flex border-b">
//         <button
//           className={`px-4 py-2 ${activeTab === 'tab1' ? 'border-b-2 border-blue-500 text-blue-600' : ''}`}
//           onClick={() => setActiveTab('tab1')}
//           type="button"
//         >
//           Tab 1
//         </button>
//         <button
//           className={`px-4 py-2 ${activeTab === 'tab2' ? 'border-b-2 border-blue-500 text-blue-600' : ''}`}
//           onClick={() => setActiveTab('tab2')}
//           type="button"
//         >
//           Tab 2
//         </button>
//         <button
//           className={`px-4 py-2 ${activeTab === 'tab3' ? 'border-b-2 border-blue-500 text-blue-600' : ''}`}
//           onClick={() => setActiveTab('tab3')}
//           type="button"
//         >
//           Tab 3
//         </button>
//       </div>

//       {activeTab === 'tab1' && (
//         <div>
//           <h3 className="font-medium">Tab 1 Content</h3>
//           <p>This is the content for Tab 1. It can include any React components.</p>
//         </div>
//       )}

//       {activeTab === 'tab2' && (
//         <div>
//           <h3 className="font-medium">Tab 2 Content</h3>
//           <p>This is the content for Tab 2. You can include forms, lists, or other components.</p>
//           <ul className="mt-2 list-inside list-disc">
//             <li>Item 1</li>
//             <li>Item 2</li>
//             <li>Item 3</li>
//           </ul>
//         </div>
//       )}

//       {activeTab === 'tab3' && (
//         <div>
//           <h3 className="font-medium">Tab 3 Content</h3>
//           <p>This is the content for Tab 3.</p>
//           <div className="mt-2 rounded bg-gray-100 p-2">
//             <code>const example = "This can be anything you want";</code>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Example chart component
// const SimpleChart: FC = () => {
//   return (
//     <div className="p-4">
//       <h3 className="mb-4 text-lg font-semibold">Sample Chart</h3>
//       <div className="flex h-64 items-center justify-center rounded bg-gray-100">
//         {/* This is a placeholder for a real chart component */}
//         <div className="text-center">
//           <p>Chart placeholder</p>
//           <p className="text-sm text-gray-500">
//             In a real application, you would render a chart library component here
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Main example component
// const ComponentModalExample: FC = () => {
//   const { openComponentModal, closeModal } = useModal();
//   const [userData, setUserData] = useState<UserData | null>(null);

//   // Handle form submission from the modal
//   const handleFormSubmit = (data: UserData) => {
//     setUserData(data);
//     closeModal();
//   };

//   // Open form modal with hook
//   const openFormModal = () => {
//     openComponentModal({
//       title: 'User Registration Form',
//       component: <UserForm onSubmit={handleFormSubmit} />,
//       showConfirmButton: false,
//     });
//   };

//   return (
//     <div className="space-y-6 p-6">
//       <h1 className="text-2xl font-bold">Component Modal Examples</h1>

//       <div className="space-y-2">
//         <h2 className="text-xl">Using Hooks</h2>
//         <button
//           type="button"
//           onClick={openFormModal}
//           className="rounded bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
//         >
//           Open Form Modal (Hook)
//         </button>
//       </div>

//       <div className="space-y-2">
//         <h2 className="text-xl">Using Component Buttons</h2>

//         <div className="flex flex-wrap gap-3">
//           {/* Form component in modal */}
//           <ComponentModalButton
//             options={{
//               title: 'User Registration',
//               component: <UserForm onSubmit={handleFormSubmit} />,
//               showConfirmButton: false,
//             }}
//             buttonText="Form Component"
//             className="rounded bg-green-600 px-4 py-2 text-white shadow"
//           />

//           {/* Tabs component in modal */}
//           <ComponentModalButton
//             options={{
//               title: 'Tabbed Content',
//               component: <TabContent />,
//               width: '600px',
//             }}
//             buttonText="Tabs Component"
//             className="rounded bg-purple-600 px-4 py-2 text-white shadow"
//           />

//           {/* Chart component in modal */}
//           <ComponentModalButton
//             options={{
//               title: 'Data Visualization',
//               component: <SimpleChart />,
//               width: '700px',
//             }}
//             buttonText="Chart Component"
//             className="rounded bg-amber-600 px-4 py-2 text-white shadow"
//           />
//         </div>
//       </div>

//       {userData && (
//         <div className="mt-6 rounded bg-gray-100 p-4">
//           <h3 className="font-medium">Submitted User Data:</h3>
//           <p>
//             <strong>Name:</strong> {userData.name}
//           </p>
//           <p>
//             <strong>Email:</strong> {userData.email}
//           </p>
//           <button
//             type="button"
//             onClick={() => setUserData(null)}
//             className="mt-2 rounded bg-gray-500 px-3 py-1 text-sm text-white"
//           >
//             Clear
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };
