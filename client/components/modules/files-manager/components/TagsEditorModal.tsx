// components/modules/file-manager/components/TagsEditorModal.tsx
import React, { useState, useRef } from 'react';
import { TagsEditorModalProps, FileTag } from '../types';
import { useClickOutside } from '../hooks/useClickOutside';
import { getTagColorClass, createNewTag, TAG_COLORS } from '../utils/tagHelpers';
import XIcon from '@/components/icon/XIcon';
import CompleteTickIcon from '@/components/icon/CompleteTickIcon';

const TagsEditorModal: React.FC<TagsEditorModalProps> = ({
  isOpen,
  onClose,
  file,
  availableTags = [],
  onSave,
}) => {
  const [selectedTags, setSelectedTags] = useState<FileTag[]>(file.tags || []);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalRef, onClose);

  if (!isOpen) return null;

  const isTagSelected = (tagId: string) => {
    return selectedTags.some((tag) => tag.id === tagId);
  };

  const toggleTag = (tag: FileTag) => {
    if (isTagSelected(tag.id)) {
      setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleCreateNewTag = () => {
    if (!newTagName.trim()) return;

    const newTag = createNewTag(newTagName, newTagColor);
    setSelectedTags([...selectedTags, newTag]);
    setNewTagName('');
  };

  const handleSave = () => {
    onSave(file, selectedTags);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        ref={modalRef}
        className="flex max-h-[80vh] w-full max-w-md flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-lg font-medium text-gray-900">Manage Tags</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <XIcon width={20} height={20} />
          </button>
        </div>

        <div className="border-b border-gray-200 px-4 py-3">
          <p className="mb-2 text-sm text-gray-500">File: {file.name}</p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Add new tag..."
              className="block w-full flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <div className="relative">
              <select
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="h-full rounded-md border-gray-300 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {TAG_COLORS.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleCreateNewTag}
              disabled={!newTagName.trim()}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Add
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Available Tags</h4>
            {availableTags.length === 0 ? (
              <p className="text-sm text-gray-500">No tags available. Create a new tag above.</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const colorClasses = getTagColorClass(tag.color || 'gray');
                  const isSelected = isTagSelected(tag.id);

                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag)}
                      className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium ${
                        isSelected
                          ? `${colorClasses.bg} ${colorClasses.text} ring-2 ring-blue-500 ring-offset-2`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag.name}
                      {isSelected && <CompleteTickIcon width={16} height={16} />}
                    </button>
                  );
                })}
              </div>
            )}

            <h4 className="mt-4 text-sm font-medium text-gray-700">Selected Tags</h4>
            {selectedTags.length === 0 ? (
              <p className="text-sm text-gray-500">No tags selected.</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedTags.map((tag) => {
                  const colorClasses = getTagColorClass(tag.color || 'gray');

                  return (
                    <div
                      key={tag.id}
                      className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium ${colorClasses.bg} ${colorClasses.text}`}
                    >
                      {tag.name}
                      <button
                        onClick={() => toggleTag(tag)}
                        className="ml-1.5 text-current hover:text-gray-700"
                      >
                        <XIcon width={14} height={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 border-t border-gray-200 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagsEditorModal;
