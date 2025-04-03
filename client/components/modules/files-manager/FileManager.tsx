// components/modules/file-manager/FileManager.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { FileManagerProps, FileData, ViewMode, FileTag, SortOption, SortDirection } from './types';
import { useFileSelection } from './hooks/useFileSelection';
import { useFileSorting } from './hooks/useFileSorting';
import { useFileActions } from './hooks/useFileActions';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';
import { selectUploadedFilesByOwnerId } from '@/store/features/files/files.api';
import FileCard from './components/FileCard';
import FileRow from './components/FileRow';
import FilterBar from './components/FilterBar';
import EmptyState from './components/EmptyState';
import TagsEditorModal from './components/TagsEditorModal';

const FileManager: React.FC<FileManagerProps> = ({
  ownerId,
  bucket,
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
}) => {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState<FileData[]>([]);

  // Refs
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
    sortBy: currentSortBy,
    sortDirection: currentSortDirection,
    changeSortOption,
    toggleSortDirection,
    sortFiles,
  } = useFileSorting(sortBy, sortDirection);

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

  // Observe the loader element for infinite scrolling
  const isIntersecting = useIntersectionObserver(
    loaderRef,
    { rootMargin: '100px' },
    hasMore && !isLoading,
  );

  // TODO: handle api response types and redux related stuff
  // Redux selector to get files
  const uploadedFiles = useSelector(selectUploadedFilesByOwnerId(ownerId));

  // Transform uploaded files to our format
  const transformFilesToFileData = useCallback((): FileData[] => {
    // In a real app, you would transform the data from your API to match FileData
    return uploadedFiles.map((file) => ({
      id: file.id,
      name: file.fileData.name,
      bucket: bucket,
      type: file.fileData.type || 'application/octet-stream',
      size: file.fileData.size || 0,
      // uploadDate: new Date(file.uploadedAt || Date.now()),
      uploadDate: new Date(Date.now()),
      // url: file.url || '',
      url: 'https://template.canva.com/EAFhyCRf5bU/2/0/800w-L1ltAmSR1OU.jpg',
      // thumbnailUrl: file.thumbnailUrl || '',
      thumbnailUrl:
        'https://marketplace.canva.com/EAF_MDLuAl8/3/0/1600w/canva-green-passive-income-ideas-youtube-thumbnail-ieZVlaB0J5A.jpg',
      // tags: file.tags || [],
      tags: [
        { name: 'new', id: '1', color: 'red' },
        { name: 'test', id: '1', color: 'blue' },
      ],
    }));
  }, [uploadedFiles, bucket]);

  // Filter and sort files based on current filters and search
  useEffect(() => {
    const transformedFiles = transformFilesToFileData();

    let filtered = [...transformedFiles];

    // Apply file type filter
    if (filterTypes && filterTypes.length > 0) {
      filtered = filtered.filter((file) => filterTypes.some((type) => file.type.includes(type)));
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((file) => {
        const matchesName = file.name.toLowerCase().includes(query);
        const matchesType = file.type.toLowerCase().includes(query);
        const matchesTags = file.tags?.some((tag) => tag.name.toLowerCase().includes(query));
        return matchesName || matchesType || matchesTags;
      });
    }

    // Apply sorting
    const sorted = sortFiles(filtered);

    // Apply pagination for initial load
    setFilteredFiles(sorted.slice(0, itemsPerPage * page));
    setHasMore(sorted.length > itemsPerPage * page);
  }, [transformFilesToFileData, filterTypes, searchQuery, sortFiles, page, itemsPerPage]);

  // Handle infinite scroll
  useEffect(() => {
    if (isIntersecting && hasMore && !isLoading) {
      setIsLoading(true);

      // Simulate loading more items with a delay
      const timer = setTimeout(() => {
        setPage((prev) => prev + 1);
        setIsLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isIntersecting, hasMore, isLoading]);

  // Handle file selection changes
  useEffect(() => {
    if (onFileSelect) {
      const selectedFiles = getSelectedFiles(filteredFiles);
      onFileSelect(selectedFiles);
    }
  }, [selectedFileIds, filteredFiles, getSelectedFiles, onFileSelect]);

  // Handle batch operations for selected files
  const handleBatchDownload = useCallback(() => {
    const selectedFiles = getSelectedFiles(filteredFiles);
    selectedFiles.forEach((file) => {
      handleDownload(file);
    });
  }, [filteredFiles, getSelectedFiles, handleDownload]);

  const handleBatchDelete = useCallback(() => {
    const selectedFiles = getSelectedFiles(filteredFiles);

    // In a real app you might want to show a confirmation dialog
    if (confirm(`Delete ${selectedFiles.length} selected file(s)?`)) {
      selectedFiles.forEach((file) => {
        handleDelete(file);
      });
      clearSelection();
    }
  }, [filteredFiles, getSelectedFiles, handleDelete, clearSelection]);

  // View mode toggle handler
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // Handlers for file actions
  const handleFileView = (file: FileData) => {
    handleView(file);
  };

  const handleFileDownload = (file: FileData) => {
    handleDownload(file);
  };

  const handleFileDelete = (file: FileData) => {
    handleDelete(file);
  };

  const handleFileTagsEdit = (file: FileData) => {
    openTagsModal(file);
  };

  // Render content based on current view mode and files
  const renderContent = () => {
    if (filteredFiles.length === 0) {
      return <EmptyState message={emptyText} />;
    }

    return viewMode === 'grid' ? (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredFiles.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            isSelected={isSelected(file.id)}
            onSelect={toggleFileSelection}
            onOptionsToggle={toggleOptionsMenu}
            isOptionsOpen={activeMenuFileId === file.id}
            onView={() => handleFileView(file)}
            onDownload={() => handleFileDownload(file)}
            onDelete={() => handleFileDelete(file)}
            onTagsEdit={() => handleFileTagsEdit(file)}
          />
        ))}
      </div>
    ) : (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-10 px-4 py-3 text-left">
                  <span className="sr-only">Select</span>
                </th>
                <th scope="col" className="w-10 px-4 py-3 text-left">
                  <span className="sr-only">Type</span>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell"
                >
                  Tags
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell"
                >
                  Size
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 lg:table-cell"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 xl:table-cell"
                >
                  Type
                </th>
                <th scope="col" className="relative w-10 px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredFiles.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  isSelected={isSelected(file.id)}
                  onSelect={toggleFileSelection}
                  onOptionsToggle={toggleOptionsMenu}
                  isOptionsOpen={activeMenuFileId === file.id}
                  onView={() => handleFileView(file)}
                  onDownload={() => handleFileDownload(file)}
                  onDelete={() => handleFileDelete(file)}
                  onTagsEdit={() => handleFileTagsEdit(file)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className={`rounded-lg bg-gray-50 p-4 shadow ${className}`} ref={containerRef}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
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
      />

      <div style={{ maxHeight }} className="overflow-auto">
        {renderContent()}

        {/* Loader for infinite scrolling */}
        {hasMore && (
          <div ref={loaderRef} className="flex justify-center py-4">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                <p className="mt-2 text-sm text-gray-500">Loading more files...</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Scroll for more</p>
            )}
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
          <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <p className="mt-2 text-center">Deleting...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
