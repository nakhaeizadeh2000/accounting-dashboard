# File Manager Component

A comprehensive, modern file management system for React applications with powerful browsing, filtering, and organization capabilities.

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
- 🔄 **Real-time upload status** integration with the upload system
- 🌙 **Dark mode support** with automatic theme detection

## Installation

The File Manager is integrated into the main project and requires no additional installation.

## Basic Usage

```tsx
import { FileManager } from '@/components/modules/file-manager';

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

## Advanced Usage

```tsx
import { FileManager } from '@/components/modules/file-manager';
import { FileData, FileTag } from '@/components/modules/file-manager/types';

const AdvancedFilesPage = () => {
  const handleFileView = (file: FileData) => {
    console.log('Viewing file:', file);
  };
  
  const handleFileDownload = (file: FileData) => {
    console.log('Downloading file:', file);
  };
  
  const handleFileDelete = (file: FileData) => {
    console.log('Deleting file:', file);
  };
  
  const handleTagsUpdate = (file: FileData, tags: FileTag[]) => {
    console.log('Updating tags for file:', file, 'with tags:', tags);
  };
  
  const availableTags: FileTag[] = [
    { id: '1', name: 'Important', color: 'red' },
    { id: '2', name: 'Work', color: 'blue' },
    { id: '3', name: 'Personal', color: 'green' },
  ];
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Advanced File Management</h1>
      
      <FileManager
        ownerId="advanced-file-manager"
        bucket="documents"
        title="Documents"
        maxHeight="600px"
        defaultView="grid"
        sortBy="date"
        sortDirection="desc"
        filterTypes={["application/pdf", "text/"]}
        availableTags={availableTags}
        onFileView={handleFileView}
        onFileDownload={handleFileDownload}
        onFileDelete={handleFileDelete}
        onTagsUpdate={handleTagsUpdate}
        showUploadingFiles={true}
        refreshInterval={30000}
      />
    </div>
  );
};
```

## Props

The FileManager component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ownerId` | `string` | **Required** | Unique ID for this instance of the file manager |
| `bucket` | `string` | `'default'` | Bucket to fetch files from |
| `title` | `string` | `'Files'` | Title displayed in the component header |
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
| `showUploadingFiles` | `boolean` | `true` | Show files that are currently being uploaded |
| `refreshInterval` | `number` | - | Auto-refresh interval in ms |

## Core Types

### FileData

```typescript
interface FileData {
  id: string;
  name: string;
  bucket: string;
  path?: string;
  type: string;
  size: number;
  uploadDate: Date;
  thumbnailUrl?: string;
  url?: string;
  metadata?: Record<string, any>;
  tags?: FileTag[];
  status?: string;
  progress?: number;
}
```

### FileTag

```typescript
interface FileTag {
  id: string;
  name: string;
  color?: string;
}
```

## File Views

The FileManager supports two view modes:

### Grid View

Displays files as thumbnails in a responsive grid layout, ideal for visual content like images and videos. This view emphasizes thumbnails and provides a visual overview of the files.

### List View

Displays files in a detailed list with columns for name, tags, size, date, and type. This view is better for document-heavy collections where metadata is more important than visual preview.

## File Actions

Each file can be interacted with using the following actions:

| Action | Description | Use Case |
|--------|-------------|----------|
| View | Opens the file for preview | Viewing images, PDFs, or other previewable content |
| Download | Downloads the file to the user's device | Obtaining a local copy of the file |
| Delete | Removes the file permanently | Removing unwanted files |
| Edit Tags | Opens a modal to manage file tags | Organizing files with metadata |

## Batch Operations

When multiple files are selected, the following batch operations become available:

| Operation | Description |
|-----------|-------------|
| Download Selected | Downloads all selected files |
| Delete Selected | Deletes all selected files (with confirmation) |

## Filtering and Sorting

The file manager provides robust filtering and sorting capabilities:

### Filtering Options

- Text search across filename, type, and tags
- MIME type filtering (e.g., only show images or documents)

### Sorting Options

| Option | Direction | Description |
|--------|-----------|-------------|
| Name | Asc/Desc | Alphabetical sorting by filename |
| Date | Asc/Desc | Chronological sorting by upload date |
| Size | Asc/Desc | Sorting by file size |
| Type | Asc/Desc | Sorting by file type/extension |

## File Tagging

The tagging system allows for flexible file organization:

- Each file can have multiple tags
- Tags have colors for visual identification
- Available tags can be predefined via the `availableTags` prop
- Tags can be added, removed, or managed via the tag editor modal

Example tag structure:

```tsx
const availableTags = [
  { id: '1', name: 'Important', color: 'red' },
  { id: '2', name: 'Work', color: 'blue' },
  { id: '3', name: 'Personal', color: 'green' },
  { id: '4', name: 'Archive', color: 'gray' },
];
```

## Upload Integration

The file manager can display files that are currently being uploaded by setting `showUploadingFiles` to `true`. This creates a seamless experience between upload and management.

Files in the upload process will display:
- Upload progress indicators
- Current status (uploading, waiting, completed, failed)
- File metadata (name, size, type)

## Infinite Scrolling

For large file collections, the component implements efficient infinite scrolling:

1. Initial batch of files is loaded based on `itemsPerPage`
2. As the user scrolls, additional batches are loaded
3. Loading indicators are displayed during fetch operations
4. Only visible files are rendered for optimal performance

## Error Handling

The component handles various error scenarios gracefully:

- API connection errors with retry options
- File not found errors during operations
- Permission errors with appropriate messages
- Network interruptions with recovery options

## Integration Examples

### With File Upload Components

```tsx
import { FileManager } from '@/components/modules/file-manager';
import { MultiFileUpload } from '@/components/modules/upload-files';

const FilesWithUpload = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Files</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
        <MultiFileUpload
          id="file-uploader"
          bucket="documents"
          acceptedFileTypes="image/*,application/pdf,video/*"
        />
      </div>
      
      <FileManager
        ownerId="my-files-display"
        bucket="documents"
        showUploadingFiles={true}
        refreshInterval={5000}
      />
    </div>
  );
};
```

### With Custom Styling

```tsx
import { FileManager } from '@/components/modules/file-manager';

const CustomStyledFileManager = () => {
  return (
    <div className="container mx-auto p-4">
      <FileManager
        ownerId="styled-file-manager"
        bucket="images"
        title="Image Gallery"
        className="border border-purple-300 rounded-xl shadow-xl"
        maxHeight="800px"
        defaultView="grid"
        filterTypes={["image/"]}
      />
    </div>
  );
};
```

## Custom Integration

The file manager is built from composable parts that can be used individually:

```tsx
import { useFileSelection } from '@/components/modules/file-manager/hooks/useFileSelection';
import { useFileSorting } from '@/components/modules/file-manager/hooks/useFileSorting';
import { FileCard } from '@/components/modules/file-manager/components/FileCard';

const CustomFileGrid = ({ files }) => {
  const { selectedFileIds, toggleFileSelection } = useFileSelection();
  const { sortFiles } = useFileSorting('name', 'asc');
  
  const sortedFiles = sortFiles(files);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {sortedFiles.map(file => (
        <FileCard
          key={file.id}
          file={file}
          isSelected={selectedFileIds.includes(file.id)}
          onSelect={toggleFileSelection}
          // other props...
        />
      ))}
    </div>
  );
};
```

## Best Practices

1. **Provide a unique `ownerId`** for each FileManager instance to prevent state conflicts
2. **Set appropriate `maxHeight`** to fit within your page layout
3. **Use `filterTypes`** to narrow down file types for specific contexts
4. **Include custom `onFile*` handlers** for specialized behavior
5. **Implement appropriate tag colors** that match your application's color scheme
6. **Configure `refreshInterval`** based on expected update frequency
7. **Consider accessibility** when designing custom integrations

## Implementation Notes

The FileManager is built using a collection of specialized hooks and components:

- `useFileSelection`: Manages file selection state
- `useFileSorting`: Handles file sorting logic
- `useFileActions`: Coordinates file operations (view, download, delete)
- `useIntersectionObserver`: Powers the infinite scrolling functionality

These building blocks can be used independently for custom implementations.

## Browser Compatibility

The component is fully compatible with modern browsers:
- Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile browsers on iOS and Android
- Responsive design works from phones to desktop screens

## Performance Considerations

For optimal performance with large file collections:
- Use the `itemsPerPage` prop to control batch size (20-50 items recommended)
- Implement appropriate server-side filtering when possible
- Consider using `refreshInterval` strategically (higher values reduce API load)