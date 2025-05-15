# Dropdown Component

A flexible and customizable dropdown component for React applications. This component supports single and multi-select functionality, custom rendering, search capabilities, and more.

## Table of Contents

- [Dropdown Component](#dropdown-component)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Basic Usage](#basic-usage)
  - [Advanced Usage](#advanced-usage)
    - [Multi-select Dropdown](#multi-select-dropdown)
    - [Using with useDropdown Hook](#using-with-usedropdown-hook)
  - [API Reference](#api-reference)
    - [Dropdown Props](#dropdown-props)
    - [ItemType](#itemtype)
  - [Hooks](#hooks)
    - [useDropdown](#usedropdown)
      - [Parameters](#parameters)
      - [Return Value](#return-value)
  - [Examples](#examples)
    - [Simple Dropdown](#simple-dropdown)
    - [Multi-select Dropdown](#multi-select-dropdown-1)
    - [Searchable Dropdown](#searchable-dropdown)
    - [Custom Rendering](#custom-rendering)
  - [Styling](#styling)

## Installation

The Dropdown component is already included in your project. You can import it directly:

```tsx
import Dropdown from '@/components/modules/dropdown/Dropdown';
import { ItemType } from '@/components/modules/dropdown/types';
```

## Basic Usage

Here's a simple example of how to use the Dropdown component:

```tsx
import { useState } from 'react';
import Dropdown from '@/components/modules/dropdown/Dropdown';
import { ItemType } from '@/components/modules/dropdown/types';

const options: ItemType[] = [
  { id: '1', label: 'Option 1' },
  { id: '2', label: 'Option 2' },
  { id: '3', label: 'Option 3' },
];

const MyComponent = () => {
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);

  return (
    <Dropdown
      items={options}
      value={selectedItem}
      onChange={(item) => setSelectedItem(item)}
      placeholder="Select an option"
    />
  );
};
```

## Advanced Usage

### Multi-select Dropdown

The Dropdown component supports multi-select functionality, allowing users to select multiple items from the list:

```tsx
import { useState } from 'react';
import Dropdown from '@/components/modules/dropdown/Dropdown';
import { ItemType } from '@/components/modules/dropdown/types';

const options: ItemType[] = [
  { id: '1', label: 'Option 1' },
  { id: '2', label: 'Option 2' },
  { id: '3', label: 'Option 3' },
];

const MyComponent = () => {
  const [selectedItems, setSelectedItems] = useState<ItemType[]>([]);

  return (
    <Dropdown
      items={options}
      value={selectedItems}
      onChange={(items) => setSelectedItems(items)}
      placeholder="Select options"
      isMulti={true}
      closeOnSelect={false}
    />
  );
};
```

### Using with useDropdown Hook

For more control over the dropdown state and behavior, you can use the `useDropdown` hook:

```tsx
import { useDropdown } from '@/components/modules/dropdown/hooks/useDropdown';
import Dropdown from '@/components/modules/dropdown/Dropdown';
import { ItemType } from '@/components/modules/dropdown/types';

const options: ItemType[] = [
  { id: '1', label: 'Option 1' },
  { id: '2', label: 'Option 2' },
  { id: '3', label: 'Option 3' },
];

const MyComponent = () => {
  const { 
    selectedItem, 
    handleSelect, 
    isOpen, 
    toggleDropdown, 
    closeDropdown,
    filteredItems 
  } = useDropdown({
    items: options,
    initialValue: null,
    isMulti: false
  });

  return (
    <Dropdown
      items={filteredItems}
      value={selectedItem}
      onChange={handleSelect}
      isOpen={isOpen}
      onToggle={toggleDropdown}
      onClose={closeDropdown}
      placeholder="Select an option"
      isSearchable={true}
    />
  );
};
```

## API Reference

### Dropdown Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `ItemType[]` | `[]` | Array of items to display in the dropdown |
| `value` | `ItemType \| ItemType[] \| null` | `null` | Selected item(s) |
| `onChange` | `(item: ItemType \| ItemType[] \| null) => void` | - | Callback when selection changes |
| `placeholder` | `string` | `'Select...'` | Placeholder text when no item is selected |
| `isMulti` | `boolean` | `false` | Enable multi-select mode |
| `isSearchable` | `boolean` | `false` | Enable search functionality |
| `isDisabled` | `boolean` | `false` | Disable the dropdown |
| `closeOnSelect` | `boolean` | `true` | Close dropdown after selection (in single select mode) |
| `isOpen` | `boolean` | - | Control the open state externally |
| `onToggle` | `() => void` | - | Callback when dropdown is toggled |
| `onClose` | `() => void` | - | Callback when dropdown is closed |
| `containerClass` | `string` | `''` | Additional CSS class for the container |
| `dropdownClass` | `string` | `''` | Additional CSS class for the dropdown menu |
| `renderOption` | `(item: ItemType) => ReactNode` | - | Custom render function for dropdown options |
| `renderSelected` | `(item: ItemType \| ItemType[]) => ReactNode` | - | Custom render function for selected item(s) |
| `noOptionsMessage` | `string` | `'No options available'` | Message to display when no options are available |
| `noResultsMessage` | `string` | `'No results found'` | Message to display when search returns no results |

### ItemType

The basic structure for items in the dropdown:

```typescript
interface ItemType {
  id: string;         // Unique identifier for the item
  label: string;      // Display text for the item
  disabled?: boolean; // Whether the item is selectable
  [key: string]: any; // Additional custom properties
}
```

## Hooks

### useDropdown

A custom hook to manage dropdown state and functionality.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options` | `object` | `{}` | Configuration options for the hook |
| `options.items` | `ItemType[]` | `[]` | Array of dropdown items |
| `options.initialValue` | `ItemType \| ItemType[] \| null` | `null` | Initial selected value(s) |
| `options.isMulti` | `boolean` | `false` | Enable multi-select mode |
| `options.onSelect` | `(item: ItemType \| ItemType[] \| null) => void` | - | Callback when selection changes |

#### Return Value

```typescript
{
  selectedItem,          // Currently selected item(s)
  handleSelect,          // Function to handle selection
  isOpen,                // Boolean indicating if dropdown is open
  toggleDropdown,        // Function to toggle dropdown
  openDropdown,          // Function to open dropdown
  closeDropdown,         // Function to close dropdown
  searchTerm,            // Current search term
  setSearchTerm,         // Function to set search term
  filteredItems          // Items filtered by search term
}
```

## Examples

### Simple Dropdown

A basic dropdown for selecting a single item:

```tsx
import { useState } from 'react';
import Dropdown from '@/components/modules/dropdown/Dropdown';
import { ItemType } from '@/components/modules/dropdown/types';

const fruits: ItemType[] = [
  { id: '1', label: 'Apple' },
  { id: '2', label: 'Banana' },
  { id: '3', label: 'Cherry' }
];

const FruitSelector = () => {
  const [selectedFruit, setSelectedFruit] = useState<ItemType | null>(null);

  return (
    <div className="p-4">
      <label className="block mb-2 text-sm font-medium">Select a fruit:</label>
      <Dropdown
        items={fruits}
        value={selectedFruit}
        onChange={setSelectedFruit}
        placeholder="Select a fruit"
        containerClass="w-64"
      />
    </div>
  );
};
```

### Multi-select Dropdown

A dropdown that allows selecting multiple items:

```tsx
import { useState } from 'react';
import Dropdown from '@/components/modules/dropdown/Dropdown';
import { ItemType } from '@/components/modules/dropdown/types';

const frameworks: ItemType[] = [
  { id: '1', label: 'React' },
  { id: '2', label: 'Vue' },
  { id: '3', label: 'Angular' },
  { id: '4', label: 'Svelte' }
];

const FrameworkSelector = () => {
  const [selectedFrameworks, setSelectedFrameworks] = useState<ItemType[]>([]);

  return (
    <div className="p-4">
      <label className="block mb-2 text-sm font-medium">Select frameworks:</label>
      <Dropdown
        items={frameworks}
        value={selectedFrameworks}
        onChange={setSelectedFrameworks}
        placeholder="Select frameworks"
        isMulti={true}
        closeOnSelect={false}
        containerClass="w-full"
      />
      
      <div className="mt-4">
        <p>Selected: {selectedFrameworks.map(f => f.label).join(', ')}</p>
      </div>
    </div>
  );
};
```

### Searchable Dropdown

A dropdown with search functionality for filtering items:

```tsx
import { useState } from 'react';
import Dropdown from '@/components/modules/dropdown/Dropdown';
import { ItemType } from '@/components/modules/dropdown/types';

const countries: ItemType[] = [
  { id: '1', label: 'United States' },
  { id: '2', label: 'Canada' },
  { id: '3', label: 'United Kingdom' },
  { id: '4', label: 'Australia' },
  { id: '5', label: 'Germany' },
  { id: '6', label: 'France' },
  // ... more countries
];

const CountrySelector = () => {
  const [selectedCountry, setSelectedCountry] = useState<ItemType | null>(null);

  return (
    <div className="p-4">
      <label className="block mb-2 text-sm font-medium">Select a country:</label>
      <Dropdown
        items={countries}
        value={selectedCountry}
        onChange={setSelectedCountry}
        placeholder="Search for a country"
        isSearchable={true}
        containerClass="w-full md:w-1/2"
      />
    </div>
  );
};
```

### Custom Rendering

Customizing the appearance of dropdown items and selected values:

```tsx
import { useState } from 'react';
import Dropdown from '@/components/modules/dropdown/Dropdown';
import { ItemType } from '@/components/modules/dropdown/types';

interface UserItem extends ItemType {
  avatar: string;
  role: string;
}

const users: UserItem[] = [
  { id: '1', label: 'John Doe', avatar: '/avatars/john.jpg', role: 'Admin' },
  { id: '2', label: 'Jane Smith', avatar: '/avatars/jane.jpg', role: 'Editor' },
  { id: '3', label: 'Bob Johnson', avatar: '/avatars/bob.jpg', role: 'Viewer' }
];

const UserSelector = () => {
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  return (
    <div className="p-4">
      <label className="block mb-2 text-sm font-medium">Select a user:</label>
      <Dropdown
        items={users}
        value={selectedUser}
        onChange={setSelectedUser}
        placeholder="Select a user"
        renderOption={(user: UserItem) => (
          <div className="flex items-center gap-2 p-1">
            <img 
              src={user.avatar} 
              alt={user.label} 
              className="w-6 h-6 rounded-full" 
            />
            <div>
              <div>{user.label}</div>
              <div className="text-xs text-gray-500">{user.role}</div>
            </div>
          </div>
        )}
        renderSelected={(user: UserItem) => (
          <div className="flex items-center gap-2">
            <img 
              src={user.avatar} 
              alt={user.label} 
              className="w-6 h-6 rounded-full" 
            />
            <span className="font-medium">{user.label}</span>
          </div>
        )}
      />
    </div>
  );
};
```

## Styling

The Dropdown component uses Tailwind CSS for styling. You can customize the appearance by providing additional classes through `containerClass` and `dropdownClass` props.

Default styling includes:
- Responsive design
- Light/dark mode support
- Focus and hover states
- Disabled state styling

Example with custom styling:

```tsx
<Dropdown
  items={options}
  value={selectedItem}
  onChange={setSelectedItem}
  placeholder="Custom styled dropdown"
  containerClass="w-full border-2 border-primary rounded-lg"
  dropdownClass="bg-white dark:bg-dark shadow-xl rounded-lg max-h-60"
/>
```

For more complex styling needs, you can use the `renderOption` and `renderSelected` props to completely customize the appearance of dropdown items and the selected value display.
