# SwitchButton Component

<div align="center">
  <img src="https://via.placeholder.com/800x200" alt="SwitchButton Banner" />
  <p><em>A versatile, customizable switch component for React applications</em></p>
</div>

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Usage](#basic-usage)
  - [With Label](#with-label)
  - [Different Styles](#different-styles)
  - [With Icons](#with-icons)
  - [Controlled vs Uncontrolled](#controlled-vs-uncontrolled)
- [API Reference](#api-reference)
  - [SwitchButton Props](#switchbutton-props)
  - [Style Options](#style-options)
  - [Icon Options](#icon-options)
- [Style Customization](#style-customization)
- [Examples](#examples)
- [Advanced Usage](#advanced-usage)
- [Performance Considerations](#performance-considerations)
- [Accessibility](#accessibility)
- [Browser Support](#browser-support)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

The SwitchButton component is a highly flexible toggle switch for React applications with Material UI. It offers multiple appearance options and follows clean code principles and SOLID design patterns.

| Feature | Description |
|---------|-------------|
| ✅ Multiple visual styles | Choose from Material, iOS, and Android styles |
| ✅ Label support | Add labels in various positions |
| ✅ Icon support | Add custom icons for on/off states |
| ✅ Color customization | Use any MUI color theme |
| ✅ Size options | Small and medium sizes available |
| ✅ Controlled/Uncontrolled | Support for both React patterns |
| ✅ Accessibility | ARIA compliant for screen readers |
| ✅ TypeScript | Full type safety with TypeScript |
| ✅ SOLID principles | Clean, maintainable architecture |

## Installation

### Prerequisites

- React 16.8+ (hooks support)
- Material UI v5+
- TypeScript (optional but recommended)

### Install dependencies

```bash
npm install @mui/material @emotion/react @emotion/styled
# or
yarn add @mui/material @emotion/react @emotion/styled
```

### Add the SwitchButton to your project

Simply copy the SwitchButton directory to your components folder:

```
components/
 modules/
  switch-Button/
   types/
     types.ts
   components/
     SwitchButtonBase.tsx
     SwitchButtonWithLabel.tsx
     SwitchButton.tsx
   styles/
      MaterialStyle.tsx
      iOSStyle.tsx
      AndroidStyle.tsx
```

## Usage

### Basic Usage

```tsx
import { SwitchButton } from './components/SwitchButton/SwitchButton';
import { useState } from 'react';

function MyComponent() {
  const [checked, setChecked] = useState(false);
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };
  
  return (
    <SwitchButton 
      onChange={handleChange} 
      checked={checked} 
    />
  );
}
```

### With Label

```tsx
<SwitchButton 
  label="Enable notifications" 
  onChange={handleChange} 
  checked={checked}
  labelPlacement="end"
/>
```

### Different Styles

```tsx
// Material Design style (default)
<SwitchButton 
  onChange={handleChange} 
  checked={checked} 
  switchStyle="material"
/>

// iOS style
<SwitchButton 
  onChange={handleChange} 
  checked={checked} 
  switchStyle="ios"
/>

// Android style
<SwitchButton 
  onChange={handleChange} 
  checked={checked} 
  switchStyle="android"
/>
```

### With Icons

```tsx
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

<SwitchButton
  onChange={handleChange}
  checked={checked}
  icon={<LightModeIcon />}
  checkedIcon={<DarkModeIcon />}
/>
```

### Controlled vs Uncontrolled

#### Controlled Component (recommended)

```tsx
const [checked, setChecked] = useState(false);

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setChecked(event.target.checked);
};

<SwitchButton 
  checked={checked}
  onChange={handleChange} 
/>
```

#### Uncontrolled Component

```tsx
<SwitchButton 
  defaultChecked={true}
  onChange={(event) => console.log(event.target.checked)} 
/>
```

## API Reference

### SwitchButton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | - | If `true`, the component is checked (controlled component) |
| `defaultChecked` | `boolean` | `false` | The default state of the switch (uncontrolled component) |
| `onChange` | `(event: React.ChangeEvent<HTMLInputElement>) => void` | - | Callback fired when the state changes |
| `disabled` | `boolean` | `false` | If `true`, the switch will be disabled |
| `color` | `'primary' \| 'secondary' \| 'error' \| 'info' \| 'success' \| 'warning' \| 'default'` | `'primary'` | The color of the component |
| `size` | `'small' \| 'medium'` | `'medium'` | The size of the component |
| `label` | `string` | - | The text to be used alongside the switch |
| `labelPlacement` | `'start' \| 'end' \| 'top' \| 'bottom'` | `'end'` | The placement of the label |
| `switchStyle` | `'material' \| 'ios' \| 'android'` | `'material'` | The visual style of the switch |
| `icon` | `React.ReactNode` | - | The icon to display when unchecked |
| `checkedIcon` | `React.ReactNode` | - | The icon to display when checked |
| `iconPosition` | `'start' \| 'end'` | `'start'` | The position of the icon relative to the switch |
| `aria-label` | `string` | `'controlled'` | The aria-label for accessibility |

### Style Options

The SwitchButton component supports three distinct visual styles:

| Style | Description | Visual |
|-------|-------------|--------|
| `material` | Material Design switch with ripple effect (default) | ![Material Switch](https://via.placeholder.com/100x50) |
| `ios` | iOS-style switch with rounded track and thumb | ![iOS Switch](https://via.placeholder.com/100x50) |
| `android` | Android-style switch with oval track | ![Android Switch](https://via.placeholder.com/100x50) |

### Icon Options

Icons can be placed on either side of the switch and can change based on the switch state:

| Configuration | Description |
|---------------|-------------|
| Only `icon` | Shows the specified icon regardless of switch state |
| Only `checkedIcon` | Shows the specified icon regardless of switch state |
| Both `icon` and `checkedIcon` | Shows `icon` when unchecked, shows `checkedIcon` when checked |
| `iconPosition="start"` | Places the icon before the switch (default) |
| `iconPosition="end"` | Places the icon after the switch |

## Style Customization

### Color Options

The component supports all Material UI theme colors:

```tsx
<SwitchButton color="primary" />   // Default blue
<SwitchButton color="secondary" /> // Purple
<SwitchButton color="error" />     // Red
<SwitchButton color="warning" />   // Orange
<SwitchButton color="info" />      // Light blue
<SwitchButton color="success" />   // Green
```

### Size Options

Material style supports two sizes:

```tsx
<SwitchButton size="medium" /> // Default
<SwitchButton size="small" />  // Smaller version
```

Note: iOS and Android styles maintain a consistent size regardless of the `size` prop.

## Examples

### Settings Panel Example

```tsx
const [settings, setSettings] = useState({
  darkMode: false,
  notifications: true,
  autoSave: true,
});

const handleChange = (setting) => (event) => {
  setSettings({
    ...settings,
    [setting]: event.target.checked,
  });
};

return (
  <div className="settings-panel">
    <h2>Settings</h2>
    
    <div className="setting-item">
      <SwitchButton
        label="Dark Mode"
        checked={settings.darkMode}
        onChange={handleChange('darkMode')}
        color="secondary"
        switchStyle="ios"
      />
    </div>
    
    <div className="setting-item">
      <SwitchButton
        label="Enable Notifications"
        checked={settings.notifications}
        onChange={handleChange('notifications')}
        color="success"
        switchStyle="material"
      />
    </div>
    
    <div className="setting-item">
      <SwitchButton
        label="Auto Save"
        checked={settings.autoSave}
        onChange={handleChange('autoSave')}
        color="primary"
        switchStyle="android"
      />
    </div>
  </div>
);
```

### Form Integration Example

```tsx
import { useForm, Controller } from 'react-hook-form';
import { SwitchButton } from './components/SwitchButton/SwitchButton';

function SubscriptionForm() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      subscribe: false,
      weeklyNewsletter: false,
      specialOffers: true,
    }
  });
  
  const onSubmit = data => console.log(data);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Controller
          name="subscribe"
          control={control}
          render={({ field }) => (
            <SwitchButton
              label="Subscribe to our service"
              onChange={field.onChange}
              checked={field.value}
              color="primary"
            />
          )}
        />
      </div>
      
      <div>
        <Controller
          name="weeklyNewsletter"
          control={control}
          render={({ field }) => (
            <SwitchButton
              label="Weekly newsletter"
              onChange={field.onChange}
              checked={field.value}
              color="info"
            />
          )}
        />
      </div>
      
      <div>
        <Controller
          name="specialOffers"
          control={control}
          render={({ field }) => (
            <SwitchButton
              label="Special offers and promotions"
              onChange={field.onChange}
              checked={field.value}
              color="success"
            />
          )}
        />
      </div>
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Advanced Usage

### Dynamic Style Selection

```tsx
import { useState } from 'react';
import { SwitchButton } from './components/SwitchButton/SwitchButton';
import { SwitchButtonStyle } from './components/SwitchButton/types';

function StyleSwitcher() {
  const [checked, setChecked] = useState(false);
  const [style, setStyle] = useState<SwitchButtonStyle>('material');
  
  const handleChangeStyle = (event) => {
    setStyle(event.target.value as SwitchButtonStyle);
  };
  
  return (
    <div>
      <select value={style} onChange={handleChangeStyle}>
        <option value="material">Material</option>
        <option value="ios">iOS</option>
        <option value="android">Android</option>
      </select>
      
      <SwitchButton
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        switchStyle={style}
      />
    </div>
  );
}
```

### Custom Icons Based on State

```tsx
import { useState } from 'react';
import { SwitchButton } from './components/SwitchButton/SwitchButton';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

function SettingsWithIcons() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  return (
    <div>
      <SwitchButton
        label="Theme"
        checked={isDarkMode}
        onChange={(e) => setIsDarkMode(e.target.checked)}
        icon={<LightModeIcon />}
        checkedIcon={<DarkModeIcon />}
        switchStyle="ios"
      />
      
      <SwitchButton
        label="Sound"
        checked={!isMuted}
        onChange={(e) => setIsMuted(!e.target.checked)}
        icon={<VolumeOffIcon />}
        checkedIcon={<VolumeUpIcon />}
        switchStyle="material"
      />
    </div>
  );
}
```

## Performance Considerations

The SwitchButton component is designed with performance in mind:

1. **Conditional Rendering**: Only renders what's needed based on props
2. **Memoization**: Uses React's memoization patterns for style components
3. **Controlled vs Uncontrolled**: Properly implements both patterns without warnings
4. **Minimized Re-renders**: Avoids unnecessary re-renders

## Accessibility

The SwitchButton component follows accessibility best practices:

- Proper `aria-label` for screen readers
- Keyboard navigable
- Supports focus states
- Color contrast considerations
- Label associations for assistive technologies

## Browser Support

The component has been tested and works in:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Warning about uncontrolled to controlled component | Make sure you're consistently using either the controlled pattern (`checked` prop) or the uncontrolled pattern (`defaultChecked` prop), but not both |
| Icons not displaying properly | Ensure you're importing icons correctly and providing them as React elements, not component references |
| Label not appearing | Verify you've provided a string to the `label` prop |
| Style not changing | Confirm the `switchStyle` prop is correctly set to one of the allowed values: `'material'`, `'ios'`, or `'android'` |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">
  <p>Made with ❤️ for React developers</p>
</div>
