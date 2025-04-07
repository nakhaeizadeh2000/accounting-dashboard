// components/modules/file-manager/FileManager.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FileManagerProps, FileData, ViewMode, FileTag, SortOption, SortDirection } from './types';
import { useFileSelection } from './hooks/useFileSelection';
import { useFileSorting } from './hooks/useFileSorting';
import { useFileActions } from './hooks/useFileActions';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';
import {
  selectUploadedFilesByOwnerId,
  useListFilesQuery,
  FileMetadata,
} from '@/store/features/files';
import FileCard from './components/FileCard';
import FileRow from './components/FileRow';
import FilterBar from './components/FilterBar';
import EmptyState from './components/EmptyState';
import TagsEditorModal from './components/TagsEditorModal';
import LoadingState from './components/LoadingState';

const FileManager: React.FC<FileManagerProps> = ({
  ownerId,
  bucket = 'default',
  title = 'Files',
  maxHeight = '600px',
  allowMultiSelect = true,
  onFileSelect,
  onFileDelete,
  onFileDownload,
  onFileView,
  onTagsUpdate,
  className = '',
  defaultView = 'grid',
  itemsPerPage = 20,
  emptyText = 'No files found',
  filterTypes,
  availableTags = [],
  sortBy = 'date',
  sortDirection = 'desc',
  showUploadingFiles = true,
  refreshInterval,
}) => {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState<FileData[]>([]);

  const {
    sortBy: currentSortBy,
    sortDirection: currentSortDirection,
    changeSortOption,
    toggleSortDirection,
    sortFiles,
  } = useFileSorting(sortBy, sortDirection);

  // Refs to track initialization and changes
  const initializedRef = useRef(false);
  const prevBucketRef = useRef(bucket);
  const prevApiFilesRef = useRef<any>(null);
  const prevUploadedFilesRef = useRef<any>(null);
  const prevSearchQueryRef = useRef(searchQuery);
  const prevFilterTypesRef = useRef(filterTypes);
  const prevSortByRef = useRef(currentSortBy);
  const prevSortDirectionRef = useRef(currentSortDirection);

  // Intersection observer ref
  const containerRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const {
    selectedFileIds,
    toggleFileSelection,
    selectAll,
    clearSelection,
    isSelected,
    getSelectedFiles,
  } = useFileSelection(allowMultiSelect);

  const {
    activeMenuFileId,
    tagsModalFile,
    isDeleting,
    toggleOptionsMenu,
    handleView,
    handleDownload,
    handleDelete,
    openTagsModal,
    closeTagsModal,
    handleTagsUpdate,
  } = useFileActions(onFileView, onFileDelete, onFileDownload, onTagsUpdate);

  // Get uploaded files from Redux (for in-progress uploads)
  const uploadedFiles = useSelector(selectUploadedFilesByOwnerId(ownerId));

  // Fetch files from the API using the new hooks with skip option
  const skipQuery = !bucket; // Skip if bucket is empty

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useListFilesQuery(
    {
      bucket,
      prefix: '',
      recursive: true,
    },
    {
      pollingInterval: refreshInterval,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      skip: skipQuery,
    },
  );

  // Extract files from the standardized response structure
  const apiFiles = apiResponse?.data;

  // Observe the loader element for infinite scrolling
  const isIntersecting = useIntersectionObserver(
    loaderRef,
    { rootMargin: '100px' },
    filteredFiles.length > 0 && filteredFiles.length >= itemsPerPage * page,
  );

  // Effect for infinite scrolling - with stable dependency
  useEffect(() => {
    if (isIntersecting && !isLoading) {
      setPage((prev) => prev + 1);
    }
  }, [isIntersecting, isLoading]);

  // Reset page when the bucket changes
  useEffect(() => {
    if (prevBucketRef.current !== bucket) {
      setPage(1);
      clearSelection();
      prevBucketRef.current = bucket;
    }
  }, [bucket, clearSelection]);

  // Process files only when necessary
  const processAndUpdateFiles = useCallback(() => {
    // Skip if we're loading initial data
    if (isLoading && !initializedRef.current) return;

    // Check if we need to update files based on dependency changes
    const bucketChanged = prevBucketRef.current !== bucket;
    const apiFilesChanged = prevApiFilesRef.current !== apiFiles;
    const uploadedFilesChanged = prevUploadedFilesRef.current !== uploadedFiles;
    const searchQueryChanged = prevSearchQueryRef.current !== searchQuery;
    const filterTypesChanged = prevFilterTypesRef.current !== filterTypes;
    const sortByChanged = prevSortByRef.current !== currentSortBy;
    const sortDirectionChanged = prevSortDirectionRef.current !== currentSortDirection;

    // Only process if something relevant has changed
    if (
      !bucketChanged &&
      !apiFilesChanged &&
      !uploadedFilesChanged &&
      !searchQueryChanged &&
      !filterTypesChanged &&
      !sortByChanged &&
      !sortDirectionChanged &&
      initializedRef.current
    ) {
      return;
    }

    // Step 1: Transform API files to FileData format
    const transformedApiFiles: FileData[] =
      apiFiles?.files?.map((file: FileMetadata) => ({
        id: file.uniqueName,
        name: file.originalName,
        bucket: file.bucket,
        type: file.mimetype,
        size: file.size,
        uploadDate: new Date(file.uploadedAt),
        thumbnailUrl: file.thumbnailUrl,
        url: file.url,
        tags: [], // API doesn't have tags yet
      })) || [];

    // Step 2: Add upload files if needed
    let allFiles = [...transformedApiFiles];

    if (showUploadingFiles && uploadedFiles.length > 0) {
      const transformedUploadedFiles = uploadedFiles
        .filter(
          (file) =>
            !transformedApiFiles.some(
              (apiFile) =>
                apiFile.name === file.fileData.name && apiFile.size === file.fileData.size,
            ),
        )
        .map((file) => ({
          id: file.id,
          name: file.fileData.name,
          bucket,
          type: file.fileData.type || 'application/octet-stream',
          size: file.fileData.size || 0,
          uploadDate: new Date(),
          url: file.metadata?.url,
          thumbnailUrl: file.metadata?.thumbnailUrl,
          tags: [],
          status: file.status,
          progress: file.progress,
        }));

      allFiles = [...transformedApiFiles, ...transformedUploadedFiles];
    }

    // Step 3: Apply filtering
    let filtered = [...allFiles];

    if (filterTypes && filterTypes.length > 0) {
      filtered = filtered.filter((file) => filterTypes.some((type) => file.type.includes(type)));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((file) => {
        const matchesName = file.name.toLowerCase().includes(query);
        const matchesType = file.type.toLowerCase().includes(query);
        const matchesTags = file.tags?.some((tag) => tag.name.toLowerCase().includes(query));
        return matchesName || matchesType || matchesTags;
      });
    }

    // Step 4: Apply sorting
    const sorted = sortFiles(filtered);

    // Step 5: Update state (OUTSIDE this effect)
    setFilteredFiles(sorted);

    // Update refs to current values to detect changes
    prevApiFilesRef.current = apiFiles;
    prevUploadedFilesRef.current = uploadedFiles;
    prevSearchQueryRef.current = searchQuery;
    prevFilterTypesRef.current = filterTypes;
    prevSortByRef.current = currentSortBy;
    prevSortDirectionRef.current = currentSortDirection;
    initializedRef.current = true;
  }, [
    apiFiles,
    bucket,
    currentSortBy,
    currentSortDirection,
    filterTypes,
    isLoading,
    searchQuery,
    showUploadingFiles,
    sortFiles,
    uploadedFiles,
  ]);

  // Run the processing function only when necessary with requestAnimationFrame
  useEffect(() => {
    // Use requestAnimationFrame to ensure we don't get stuck in a render loop
    const frameId = requestAnimationFrame(() => {
      processAndUpdateFiles();
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [processAndUpdateFiles]);

  // Notify parent component about selection changes
  const prevSelectedIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!onFileSelect) return;

    // Check if selection has actually changed
    const selectionChanged =
      prevSelectedIdsRef.current.length !== selectedFileIds.length ||
      selectedFileIds.some((id) => !prevSelectedIdsRef.current.includes(id)) ||
      prevSelectedIdsRef.current.some((id) => !selectedFileIds.includes(id));

    if (selectionChanged) {
      const selectedFiles = selectedFileIds.length > 0 ? getSelectedFiles(filteredFiles) : [];

      onFileSelect(selectedFiles);

      // Update the ref with current selection
      prevSelectedIdsRef.current = [...selectedFileIds];
    }
  }, [selectedFileIds, filteredFiles, onFileSelect, getSelectedFiles]);

  const handleBatchDownload = useCallback(() => {
    const selectedFiles = getSelectedFiles(filteredFiles);
    selectedFiles.forEach((file) => {
      handleDownload(file);
    });
  }, [filteredFiles, getSelectedFiles, handleDownload]);

  const handleBatchDelete = useCallback(() => {
    const selectedFiles = getSelectedFiles(filteredFiles);

    if (confirm(`Delete ${selectedFiles.length} selected file(s)?`)) {
      selectedFiles.forEach((file) => {
        handleDelete(file);
      });
      clearSelection();
    }
  }, [filteredFiles, getSelectedFiles, handleDelete, clearSelection]);

  // View mode toggle handler
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Render content based on current view mode and files
  const renderContent = () => {
    if (isLoading && !initializedRef.current) {
      return <LoadingState />;
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center px-4 py-12">
          <p className="font-medium text-red-500">Error loading files</p>
          <button
            onClick={handleRefresh}
            className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      );
    }

    if (filteredFiles.length === 0) {
      return <EmptyState message={emptyText} />;
    }

    // Limit displayed files by the current page
    const paginatedFiles = filteredFiles.slice(0, itemsPerPage * page);

    return viewMode === 'grid' ? (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {paginatedFiles.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            isSelected={isSelected(file.id)}
            onSelect={toggleFileSelection}
            onOptionsToggle={toggleOptionsMenu}
            isOptionsOpen={activeMenuFileId === file.id}
            onView={() => handleView(file)}
            onDownload={() => handleDownload(file)}
            onDelete={() => handleDelete(file)}
            onTagsEdit={() => openTagsModal(file)}
          />
        ))}
      </div>
    ) : (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="w-10 px-4 py-3 text-left">
                  <span className="sr-only">Select</span>
                </th>
                <th scope="col" className="w-10 px-4 py-3 text-left">
                  <span className="sr-only">Type</span>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 md:table-cell"
                >
                  Tags
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:table-cell"
                >
                  Size
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 lg:table-cell"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 xl:table-cell"
                >
                  Type
                </th>
                <th scope="col" className="relative w-10 px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {paginatedFiles.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  isSelected={isSelected(file.id)}
                  onSelect={toggleFileSelection}
                  onOptionsToggle={toggleOptionsMenu}
                  isOptionsOpen={activeMenuFileId === file.id}
                  onView={() => handleView(file)}
                  onDownload={() => handleDownload(file)}
                  onDelete={() => handleDelete(file)}
                  onTagsEdit={() => openTagsModal(file)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`rounded-lg bg-gray-50 p-4 shadow dark:bg-gray-900 ${className}`}
      ref={containerRef}
      data-component-id={ownerId}
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{title}</h2>
        {isFetching && !isLoading && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <svg
              className="-ml-1 mr-2 h-4 w-4 animate-spin text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Refreshing...</span>
          </div>
        )}
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSortChange={changeSortOption}
        onSortDirectionChange={toggleSortDirection}
        currentSort={currentSortBy}
        currentSortDirection={currentSortDirection}
        selectedFiles={selectedFileIds}
        totalFiles={filteredFiles.length}
        onSelectAll={() => selectAll(filteredFiles.map((file) => file.id))}
        onClearSelection={clearSelection}
        onDownloadSelected={handleBatchDownload}
        onDeleteSelected={handleBatchDelete}
        onViewModeChange={handleViewModeChange}
        currentViewMode={viewMode}
        onRefresh={handleRefresh}
      />

      <div style={{ maxHeight }} className="overflow-auto">
        {renderContent()}

        {/* Loader for infinite scrolling */}
        {filteredFiles.length >= itemsPerPage * page && !isLoading && (
          <div ref={loaderRef} className="flex justify-center py-4">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading more files...</p>
            </div>
          </div>
        )}
      </div>

      {/* Tags editor modal */}
      {tagsModalFile && (
        <TagsEditorModal
          isOpen={!!tagsModalFile}
          onClose={closeTagsModal}
          file={tagsModalFile}
          availableTags={availableTags}
          onSave={handleTagsUpdate}
        />
      )}

      {/* Loading overlay for delete operations */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl dark:bg-gray-800">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <p className="mt-2 text-center dark:text-gray-200">Deleting...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;

// Type for file upload status
type FileUploadStatus = 'idle' | 'selected' | 'waiting' | 'uploading' | 'completed' | 'failed';
