import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter } from 'lucide-react';

export default function SearchBar({ 
  value = '', 
  onChange, 
  placeholder = 'Search conversations...',
  showFilters = false,
  onFilterClick 
}) {
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Sync with parent value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Debounce the onChange call
    const timer = setTimeout(() => {
      onChange?.(newValue);
    }, 300);
    
    return () => clearTimeout(timer);
  };

  const handleClear = () => {
    setInputValue('');
    onChange?.('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      <div className={`relative flex items-center border rounded-lg transition-all duration-200 ${
        isFocused 
          ? 'border-blue-500 ring-2 ring-blue-200' 
          : 'border-gray-300 hover:border-gray-400'
      }`}>
        <Search className="absolute left-3 h-5 w-5 text-gray-400" />
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 rounded-lg focus:outline-none"
        />
        
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 hover:bg-gray-100 rounded-full"
            type="button"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
        
        {showFilters && (
          <button
            onClick={onFilterClick}
            className="absolute right-10 p-1 hover:bg-gray-100 rounded-full"
            type="button"
          >
            <Filter className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>
      
      {/* Search tips */}
      {isFocused && !inputValue && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border p-3 z-10">
          <p className="text-xs text-gray-500 mb-2">Try searching for:</p>
          <div className="space-y-1">
            <button
              onClick={() => {
                setInputValue('unread');
                onChange?.('unread');
              }}
              className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-50 rounded"
            >
              <span className="font-medium">unread:</span> Unread messages
            </button>
            <button
              onClick={() => {
                setInputValue('group');
                onChange?.('group');
              }}
              className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-50 rounded"
            >
              <span className="font-medium">group:</span> Group chats
            </button>
            <button
              onClick={() => {
                setInputValue('media');
                onChange?.('media');
              }}
              className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-50 rounded"
            >
              <span className="font-medium">media:</span> Photos & videos
            </button>
          </div>
        </div>
      )}
      
      {/* Recent searches (you can implement this based on your needs) */}
      {isFocused && inputValue && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border p-2 z-10">
          <p className="text-xs text-gray-500 mb-1">Recent searches</p>
          {/* Map through recent searches here */}
        </div>
      )}
    </div>
  );
}