// 'use client';

// import React, { useState, useEffect } from 'react';
// import FileManager from '../FileManager';
// import { FileData, FileTag } from '../types';
// import SingleFileUpload from '@/components/modules/upload-files/components/SingleFileUpload';
// import MultiFileUpload from '@/components/modules/upload-files/components/MultiFileUpload';
// import {
//   useFilesList,
//   useBucketsList,
//   useCreateBucketMutation,
//   useDeleteBucketMutation,
//   useFileUpload,
//   useBatchFileUpload,
//   useFileMetadata,
//   shouldHaveThumbnail,
// } from '@/store/features/files';
// import { formatFileSize, formatDate } from '../utils/fileHelpers';

// const AdvancedFileManager: React.FC = () => {
//   // State for managing view and selections
//   const [selectedBucket, setSelectedBucket] = useState('default');
//   const [selectedView, setSelectedView] = useState<'all' | 'images' | 'documents' | 'media'>('all');
//   const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
//   const [createBucketName, setCreateBucketName] = useState('');
//   const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

//   // Available tags for file categorization
//   const [availableTags] = useState<FileTag[]>([
//     { id: '1', name: 'Important', color: 'red' },
//     { id: '2', name: 'Work', color: 'blue' },
//     { id: '3', name: 'Personal', color: 'green' },
//     { id: '4', name: 'Archive', color: 'gray' },
//     { id: '5', name: 'Finance', color: 'purple' },
//     { id: '6', name: 'Project', color: 'yellow' },
//     { id: '7', name: 'Media', color: 'indigo' },
//     { id: '8', name: 'Development', color: 'teal' },
//     { id: '9', name: 'Confidential', color: 'pink' },
//     { id: '10', name: 'Draft', color: 'orange' },
//   ]);

//   // Use hooks from the file API
//   const { buckets, isLoading: isLoadingBuckets } = useBucketsList();
//   const [createBucket, { isLoading: isCreatingBucket }] = useCreateBucketMutation();
//   const [deleteBucket, { isLoading: isDeletingBucket }] = useDeleteBucketMutation();

//   // File upload hooks
//   const { uploadFile } = useFileUpload(selectedBucket);
//   const { uploadFiles } = useBatchFileUpload(selectedBucket);

//   // Get detailed metadata for selected file
//   const { metadata: selectedFileMetadata, isLoading: isLoadingMetadata } = useFileMetadata(
//     selectedFile?.bucket || selectedBucket,
//     selectedFile?.id || '',
//     !selectedFile,
//   );

//   // Filter types based on selected view
//   const getFilterTypes = () => {
//     switch (selectedView) {
//       case 'images':
//         return ['image/'];
//       case 'documents':
//         return ['application/pdf', 'text/', 'application/vnd.openxmlformats'];
//       case 'media':
//         return ['audio/', 'video/'];
//       default:
//         return undefined;
//     }
//   };

//   // Handle file selection from file manager
//   const handleFileSelect = (files: FileData[]) => {
//     if (files.length === 1) {
//       setSelectedFile(files[0]);
//     } else {
//       setSelectedFile(null);
//     }
//   };

//   // Handle file deletion completion
//   const handleFileDelete = (file: FileData) => {
//     if (selectedFile?.id === file.id) {
//       setSelectedFile(null);
//     }
//     showMessage('success', `File "${file.name}" deleted successfully`);
//   };

//   // Handle file view/preview
//   const handleFileView = (file: FileData) => {
//     console.log('Viewing file:', file);
//     // Actual viewing is handled by the useFileActions hook
//   };

//   // Handle file download
//   const handleFileDownload = (file: FileData) => {
//     console.log('Downloading file:', file);
//     // Actual download is handled by the useFileActions hook
//   };

//   // Handle tag updates
//   const handleTagsUpdate = (file: FileData, tags: FileTag[]) => {
//     // In a real app, you would call your API to update the file's tags
//     console.log(
//       'Updating tags for file:',
//       file.name,
//       'with tags:',
//       tags.map((t) => t.name).join(', '),
//     );
//     showMessage('success', `Tags updated for "${file.name}"`);
//   };

//   // Handle bucket selection change
//   const handleBucketChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setSelectedBucket(e.target.value);
//     setSelectedFile(null);
//   };

//   // Handle view type selection
//   const handleViewChange = (view: 'all' | 'images' | 'documents' | 'media') => {
//     setSelectedView(view);
//     setSelectedFile(null);
//   };

//   // Create a new bucket
//   const handleCreateBucket = async () => {
//     if (!createBucketName.trim()) {
//       showMessage('error', 'Please enter a bucket name');
//       return;
//     }

//     try {
//       await createBucket({
//         name: createBucketName,
//         publicPolicy: true,
//       }).unwrap();

//       showMessage('success', `Bucket "${createBucketName}" created successfully`);
//       setCreateBucketName('');
//     } catch (error: any) {
//       showMessage('error', `Failed to create bucket: ${error.message || 'Unknown error'}`);
//     }
//   };

//   // Delete a bucket
//   const handleDeleteBucket = async () => {
//     if (selectedBucket === 'default') {
//       showMessage('error', 'Cannot delete the default bucket');
//       return;
//     }

//     if (
//       confirm(
//         `Are you sure you want to delete bucket "${selectedBucket}"? This will delete all files inside it.`,
//       )
//     ) {
//       try {
//         await deleteBucket({
//           name: selectedBucket,
//           force: true, // Force delete even if bucket has files
//         }).unwrap();

//         setSelectedBucket('default');
//         showMessage('success', `Bucket "${selectedBucket}" deleted successfully`);
//       } catch (error: any) {
//         showMessage('error', `Failed to delete bucket: ${error.message || 'Unknown error'}`);
//       }
//     }
//   };

//   // Handle direct file upload
//   const handleDirectUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files;
//     if (!files || files.length === 0) return;

//     try {
//       // For single file
//       if (files.length === 1) {
//         const result = await uploadFile(files[0], {
//           generateThumbnail: true,
//           skipThumbnailForLargeFiles: true,
//         });
//         showMessage('success', `File "${files[0].name}" uploaded successfully`);
//       }
//       // For multiple files
//       else {
//         const filesArray = Array.from(files);
//         const result = await uploadFiles(filesArray, {
//           generateThumbnail: true,
//         });
//         showMessage('success', `${filesArray.length} files uploaded successfully`);
//       }
//     } catch (error: any) {
//       showMessage('error', `Upload failed: ${error.message || 'Unknown error'}`);
//     }
//   };

//   // Show temporary message
//   const showMessage = (type: 'success' | 'error', text: string) => {
//     setMessage({ type, text });
//     setTimeout(() => setMessage(null), 5000); // Hide after 5 seconds
//   };

//   // Handle successful uploads
//   const handleUploadSuccess = (result: any) => {
//     console.log('Upload successful:', result);
//     const filename = result.originalName || 'File';
//     showMessage('success', `"${filename}" uploaded successfully`);
//   };

//   // View selector component
//   const ViewSelector = () => (
//     <div className="mb-6 flex border-b border-gray-200 dark:border-gray-700">
//       <button
//         className={`border-b-2 px-4 py-2 ${selectedView === 'all' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
//         onClick={() => handleViewChange('all')}
//       >
//         All Files
//       </button>
//       <button
//         className={`border-b-2 px-4 py-2 ${selectedView === 'images' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
//         onClick={() => handleViewChange('images')}
//       >
//         Images
//       </button>
//       <button
//         className={`border-b-2 px-4 py-2 ${selectedView === 'documents' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
//         onClick={() => handleViewChange('documents')}
//       >
//         Documents
//       </button>
//       <button
//         className={`border-b-2 px-4 py-2 ${selectedView === 'media' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
//         onClick={() => handleViewChange('media')}
//       >
//         Media
//       </button>
//     </div>
//   );

//   // File details sidebar component
//   const FileDetailsSidebar = () => {
//     if (!selectedFile) return null;

//     const hasThumbnail =
//       selectedFile.thumbnailUrl ||
//       (selectedFileMetadata?.thumbnailUrl &&
//         shouldHaveThumbnail({
//           originalName: selectedFile.name,
//           uniqueName: selectedFile.id,
//           size: selectedFile.size,
//           mimetype: selectedFile.type,
//           bucket: selectedFile.bucket,
//           uploadedAt: selectedFile.uploadDate,
//           url: selectedFile.url || '',
//           thumbnailUrl: selectedFile.thumbnailUrl,
//         }));

//     return (
//       <div className="fixed right-0 top-0 h-full w-80 overflow-auto bg-white p-6 shadow-lg dark:bg-gray-800">
//         <div className="mb-4 flex items-center justify-between">
//           <h3 className="text-lg font-medium text-gray-900 dark:text-white">File Details</h3>
//           <button
//             onClick={() => setSelectedFile(null)}
//             className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//           >
//             ✕
//           </button>
//         </div>

//         {/* Preview */}
//         <div className="mb-4">
//           {hasThumbnail ? (
//             <img
//               src={selectedFile.thumbnailUrl || selectedFileMetadata?.thumbnailUrl}
//               alt={selectedFile.name}
//               className="h-40 w-full rounded bg-gray-100 object-contain dark:bg-gray-700"
//             />
//           ) : (
//             <div className="flex h-40 w-full items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
//               <FileTypeIcon fileType={selectedFile.type} className="h-16 w-16" />
//             </div>
//           )}
//         </div>

//         {/* File details */}
//         <dl className="space-y-2 text-sm">
//           <div>
//             <dt className="font-medium text-gray-500 dark:text-gray-400">Name</dt>
//             <dd className="mt-1 text-gray-900 dark:text-white">{selectedFile.name}</dd>
//           </div>
//           <div>
//             <dt className="font-medium text-gray-500 dark:text-gray-400">Type</dt>
//             <dd className="mt-1 text-gray-900 dark:text-white">{selectedFile.type}</dd>
//           </div>
//           <div>
//             <dt className="font-medium text-gray-500 dark:text-gray-400">Size</dt>
//             <dd className="mt-1 text-gray-900 dark:text-white">
//               {formatFileSize(selectedFile.size)}
//             </dd>
//           </div>
//           <div>
//             <dt className="font-medium text-gray-500 dark:text-gray-400">Uploaded</dt>
//             <dd className="mt-1 text-gray-900 dark:text-white">
//               {formatDate(selectedFile.uploadDate)}
//             </dd>
//           </div>
//           <div>
//             <dt className="font-medium text-gray-500 dark:text-gray-400">Bucket</dt>
//             <dd className="mt-1 text-gray-900 dark:text-white">{selectedFile.bucket}</dd>
//           </div>
//           {selectedFile.tags && selectedFile.tags.length > 0 && (
//             <div>
//               <dt className="font-medium text-gray-500 dark:text-gray-400">Tags</dt>
//               <dd className="mt-1 flex flex-wrap gap-1">
//                 {selectedFile.tags.map((tag) => (
//                   <span
//                     key={tag.id}
//                     className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
//                       tag.color === 'red'
//                         ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
//                         : tag.color === 'blue'
//                           ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
//                           : tag.color === 'green'
//                             ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
//                             : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
//                     }`}
//                   >
//                     {tag.name}
//                   </span>
//                 ))}
//               </dd>
//             </div>
//           )}
//         </dl>

//         {/* Actions */}
//         <div className="mt-6 flex space-x-3">
//           <button
//             onClick={() => handleFileView(selectedFile)}
//             className="flex-1 rounded-md bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
//           >
//             View
//           </button>
//           <button
//             onClick={() => handleFileDownload(selectedFile)}
//             className="flex-1 rounded-md bg-green-50 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
//           >
//             Download
//           </button>
//           <button
//             onClick={() => handleFileDelete(selectedFile)}
//             className="flex-1 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
//           >
//             Delete
//           </button>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="mb-6 text-3xl font-bold dark:text-white">Advanced File Manager</h1>

//       {/* Status message */}
//       {message && (
//         <div
//           className={`mb-4 rounded p-3 ${
//             message.type === 'success'
//               ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
//               : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
//           }`}
//         >
//           {message.text}
//         </div>
//       )}

//       {/* Bucket management */}
//       <div className="mb-6 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
//         <h2 className="mb-4 text-lg font-medium dark:text-white">Bucket Management</h2>

//         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//           {/* Bucket selection */}
//           <div>
//             <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Current Bucket
//             </label>
//             <div className="flex space-x-2">
//               <select
//                 value={selectedBucket}
//                 onChange={handleBucketChange}
//                 className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
//               >
//                 <option value="default">default</option>
//                 {buckets?.map((bucket) => (
//                   <option key={bucket.name} value={bucket.name}>
//                     {bucket.name}
//                   </option>
//                 ))}
//               </select>

//               {selectedBucket !== 'default' && (
//                 <button
//                   onClick={handleDeleteBucket}
//                   disabled={isDeletingBucket}
//                   className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-600 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-gray-600"
//                 >
//                   {isDeletingBucket ? 'Deleting...' : 'Delete Bucket'}
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Create new bucket */}
//           <div>
//             <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Create New Bucket
//             </label>
//             <div className="flex space-x-2">
//               <input
//                 type="text"
//                 value={createBucketName}
//                 onChange={(e) => setCreateBucketName(e.target.value)}
//                 placeholder="Enter bucket name"
//                 className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
//               />
//               <button
//                 onClick={handleCreateBucket}
//                 disabled={isCreatingBucket || !createBucketName.trim()}
//                 className="rounded-md border border-blue-300 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:bg-gray-700 dark:text-blue-400 dark:hover:bg-gray-600"
//               >
//                 {isCreatingBucket ? 'Creating...' : 'Create'}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Upload options */}
//       <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
//         {/* Single file upload */}
//         <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
//           <h3 className="mb-2 text-lg font-medium dark:text-white">Upload Single File</h3>
//           <SingleFileUpload
//             id="advanced-single-upload"
//             bucket={selectedBucket}
//             acceptedFileTypes="image/*,application/pdf,video/*"
//             maxSizeMB={50}
//             generateThumbnail={true}
//             skipThumbnailForLargeFiles={true}
//             uploadingDependsToForm={true}
//             onUploadSuccess={handleUploadSuccess}
//           />
//         </div>

//         {/* Multiple file upload */}
//         <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
//           <h3 className="mb-2 text-lg font-medium dark:text-white">Upload Multiple Files</h3>
//           <MultiFileUpload
//             id="advanced-multi-upload"
//             bucket={selectedBucket}
//             acceptedFileTypes="image/*,application/pdf,video/*,audio/*"
//             maxSizeMB={50}
//             generateThumbnail={true}
//             skipThumbnailForLargeFiles={true}
//             onUploadComplete={handleUploadSuccess}
//           />
//         </div>
//       </div>

//       {/* Direct upload option */}
//       <div className="mb-6 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
//         <h3 className="mb-2 text-lg font-medium dark:text-white">Direct Upload API</h3>
//         <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
//           Upload files directly using the file API without the UI components:
//         </p>
//         <input
//           type="file"
//           multiple
//           onChange={handleDirectUpload}
//           className="block w-full text-sm text-gray-900 dark:text-gray-200"
//         />
//       </div>

//       {/* File filtering */}
//       <div className="mb-6 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
//         <h2 className="mb-2 text-lg font-medium dark:text-white">Filtering Options</h2>
//         <ViewSelector />
//       </div>

//       {/* File Manager */}
//       <div className="relative">
//         <FileManager
//           ownerId="advanced-file-manager"
//           bucket={selectedBucket}
//           title={`${selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} Files`}
//           maxHeight="600px"
//           allowMultiSelect={false}
//           onFileSelect={handleFileSelect}
//           onFileView={handleFileView}
//           onFileDownload={handleFileDownload}
//           onFileDelete={handleFileDelete}
//           onTagsUpdate={handleTagsUpdate}
//           defaultView="grid"
//           itemsPerPage={20}
//           availableTags={availableTags}
//           filterTypes={getFilterTypes()}
//           emptyText={`No ${selectedView} files found in bucket "${selectedBucket}".`}
//           sortBy="date"
//           sortDirection="desc"
//           showUploadingFiles={true}
//           refreshInterval={30000} // Auto-refresh every 30 seconds
//           className={selectedFile ? 'mr-80' : ''}
//         />

//         {/* File details sidebar */}
//         {selectedFile && <FileDetailsSidebar />}
//       </div>

//       {/* Debug information */}
//       <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
//         <h2 className="mb-2 text-lg font-medium dark:text-white">Debug Information</h2>
//         <p className="text-sm text-gray-600 dark:text-gray-400">
//           Selected bucket:{' '}
//           <span className="rounded bg-gray-100 px-1 font-mono dark:bg-gray-800">
//             {selectedBucket}
//           </span>
//         </p>
//         <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
//           Selected view:{' '}
//           <span className="rounded bg-gray-100 px-1 font-mono dark:bg-gray-800">
//             {selectedView}
//           </span>
//         </p>
//         <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
//           Filter types:{' '}
//           <span className="rounded bg-gray-100 px-1 font-mono dark:bg-gray-800">
//             {getFilterTypes()?.join(', ') || 'none'}
//           </span>
//         </p>
//         <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
//           Total buckets:{' '}
//           <span className="rounded bg-gray-100 px-1 font-mono dark:bg-gray-800">
//             {buckets?.length || 0}
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// };

// // Import FileTypeIcon for the sidebar
// interface FileTypeIconProps {
//   fileType: string;
//   className?: string;
// }

// const FileTypeIcon: React.FC<FileTypeIconProps> = ({ fileType, className = 'h-8 w-8' }) => {
//   // Implement a simplified version directly here to avoid circular dependencies
//   const getFileCategory = (
//     type: string,
//   ): 'image' | 'video' | 'audio' | 'document' | 'compressed' | 'other' => {
//     if (type.startsWith('image/')) return 'image';
//     if (type.startsWith('video/')) return 'video';
//     if (type.startsWith('audio/')) return 'audio';
//     if (type.includes('pdf') || type.includes('document') || type.includes('text/'))
//       return 'document';
//     if (type.includes('zip') || type.includes('rar') || type.includes('compressed'))
//       return 'compressed';
//     return 'other';
//   };

//   const category = getFileCategory(fileType);

//   // Simple icon representation
//   return (
//     <div className={`flex items-center justify-center ${className}`}>
//       <span className="text-2xl">
//         {category === 'image'
//           ? '🖼️'
//           : category === 'video'
//             ? '🎬'
//             : category === 'audio'
//               ? '🎵'
//               : category === 'document'
//                 ? '📄'
//                 : category === 'compressed'
//                   ? '🗃️'
//                   : '📁'}
//       </span>
//     </div>
//   );
// };

// export default AdvancedFileManager;
