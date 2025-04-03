# File Manager Component

A modern, responsive, and feature-rich file management component for Next.js applications. This component provides a complete solution for displaying and managing files with support for grid and list views, file tagging, sorting, filtering, and more.

## Features

- 📱 **Fully responsive** design that works on all devices
- 🔄 **Grid and list views** with easy toggling between them
- 🔍 **Search and filter** capabilities for quick file location
- 🏷️ **File tagging system** for better organization
- ↕️ **Sorting options** by name, date, size, and type
- ⚡ **Infinite scrolling** for performant loading of large file collections
- ✅ **Multi-select functionality** for batch operations
- 🎛️ **Comprehensive file actions** including view, download, delete, and tag management
- 🧩 **Highly customizable** through props and theming

## Installation

1. Copy the `file-manager` directory into your project's components folder
2. Ensure you have the required icon components:
   - AudioFileIcon
   - CompleteTickIcon
   - CompressedFileIcon
   - DocumentFileIcon
   - FailedXmarkIcon
   - FolderIcon
   - ImageFileIcon
   - VideoFileIcon
   - XIcon

3. Install required dependencies if not already present:
```bash
npm install @reduxjs/toolkit react-redux
# or
yarn add @reduxjs/toolkit react-redux
```

## Usage

### Basic Usage

```tsx
import FileManager from '@/components/modules/file-manager/FileManager';

const MyFilesPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Files</h1>
      
      <FileManager
        ownerId="my-files-page"
        bucket="documents"
        title="Documents"
        maxHeight="600px"
      />
    </div>
  );
};

export default MyFilesPage;
```

### With Custom Handlers

```tsx
import FileManager from '@/components/modules/file-manager/FileManager';
import { FileData, FileTag } from '@/components/modules/file-manager/types';

const MyFilesPage = () => {
  const handleFileView = (file: FileData) => {
    // Your custom view logic
    console.log('Viewing file:', file);
  };
  
  const handleFileDownload = (file: FileData) => {
    // Your custom download logic
    console.log('Downloading file:', file);
  };
  
  const handleFileDelete = (file: FileData) => {
    // Your custom delete logic
    console.log('Deleting file:', file);
  };
  
  const handleTagsUpdate = (file: FileData, tags: FileTag[]) => {
    // Your custom tag update logic
    console.log('Updating tags for file:', file, 'with tags:', tags);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Files</h1>
      
      <FileManager
        ownerId="my-files-page"
        bucket="documents"
        title="Documents"
        maxHeight="600px"
        onFileView={handleFileView}
        onFileDownload={handleFileDownload}
        onFileDelete={handleFileDelete}
        onTagsUpdate={handleTagsUpdate}
      />
    </div>
  );
};

export default MyFilesPage;
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ownerId` | `string` | **Required** | Unique ID for this instance of the file manager |
| `bucket` | `string` | **Required** | Bucket to fetch files from |
| `title` | `string` | `'Files'` | Optional title for the component |
| `maxHeight` | `string` | `'600px'` | CSS max-height value |
| `allowMultiSelect` | `boolean` | `true` | Allow selecting multiple files |
| `onFileSelect` | `(files: FileData[]) => void` | - | Callback when files are selected |
| `onFileDelete` | `(file: FileData) => void` | - | Callback when a file is deleted |
| `onFileDownload` | `(file: FileData) => void` | - | Callback when a file is downloaded |
| `onFileView` | `(file: FileData) => void` | - | Callback when a file is viewed |
| `onTagsUpdate` | `(file: FileData, tags: FileTag[]) => void` | - | Callback when tags are updated |
| `className` | `string` | `''` | Additional CSS classes |
| `defaultView` | `'grid' \| 'list'` | `'grid'` | Default view mode |
| `itemsPerPage` | `number` | `20` | Number of items to load per page/batch |
| `emptyText` | `string` | `'No files found'` | Text to display when no files |
| `filterTypes` | `string[]` | - | Filter files by these types |
| `availableTags` | `FileTag[]` | `[]` | Available tags to choose from |
| `sortBy` | `'name' \| 'date' \| 'size' \| 'type'` | `'date'` | Sort files by |
| `sortDirection` | `'asc' \| 'desc'` | `'desc'` | Sort direction |

## Component Structure

The file manager is built as a modular system with the following key components:

- `FileManager.tsx` - Main component that orchestrates everything
- `FileCard.tsx` - Grid view item component
- `FileRow.tsx` - List view item component
- `FileTypeIcon.tsx` - Displays appropriate icon based on file type
- `FileTags.tsx` - Displays file tags
- `OptionsMenu.tsx` - Context menu for file actions
- `TagsEditorModal.tsx` - Modal for editing file tags
- `FilterBar.tsx` - Filter and search controls
- `EmptyState.tsx` - Display when no files are found

## State Management

The file manager integrates with Redux Toolkit through several hooks:

- `useFileSelection` - Manages file selection state
- `useFileSorting` - Manages sorting options
- `useFileActions` - Handles file operations
- `useIntersectionObserver` - Powers the infinite scrolling functionality

## Custom Styling

The file manager uses Tailwind CSS for styling and is designed to be easily customizable. You can override the default styles by:

1. Adding custom class names to the `className` prop
2. Modifying the Tailwind theme in your `tailwind.config.js`
3. Directly editing the component files to match your design system

## Integration with Redux

If you need to customize the state management or integrate with a different API, you'll want to modify the following files:

- `hooks/useFileActions.ts` - Contains the actions for file operations
- `FileManager.tsx` - Contains the state handling logic

## Examples

Check out the examples directory for more advanced usage patterns:

- `examples/SimpleFileManager.tsx` - A basic implementation
- `examples/AdvancedFileManager.tsx` - Advanced implementation with filtering

## Additional Icon Requirements

For complete functionality, you may want to add these additional icons:

- EyeIcon (for preview action)
- DownloadIcon (for download action)
- TagIcon (for managing tags)
- TrashIcon (for delete action)
- SearchIcon (for search functionality)
- SortAscIcon / SortDescIcon (for sorting indicators)
- GridViewIcon / ListViewIcon (for view mode toggle)

## License

This component is provided as-is with no warranty. Use it as you see fit in your projects.