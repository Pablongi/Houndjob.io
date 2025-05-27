import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownButton = styled.button`
  padding: 2px 4px;
  background: #fff;
  color: var(--zhipin-text);
  border: 1px solid var(--zhipin-border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px; /* Increased from 10px */
  font-family: sans-serif;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  width: 100%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: background 0.2s ease;
  &:hover {
    background: #f0f0f0;
  }
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  width: 200px;
  background: #fff;
  border: 1px solid var(--zhipin-border);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const SearchContainer = styled.div`
  position: sticky;
  top: 0;
  background: #fff;
  padding: 4px;
  border-bottom: 1px solid var(--zhipin-border);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 4px 8px 4px 24px;
  border: none;
  font-size: 12px; /* Increased from 10px */
  font-family: sans-serif;
  outline: none;
  box-sizing: border-box;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>') no-repeat 4px center;
  background-size: 16px;
`;

const OptionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
`;

const OptionItem = styled(motion.li)<{ active: boolean }>`
  padding: 4px 8px;
  font-size: 12px; /* Increased from 10px */
  font-family: sans-serif;
  color: ${({ active }) => (active ? 'var(--zhipin-teal)' : 'var(--zhipin-text)')};
  background: ${({ active }) => (active ? '#fff' : 'transparent')};
  border: 1px solid ${({ active }) => (active ? 'var(--zhipin-teal)' : 'transparent')};
  border-radius: 4px;
  margin: 2px 4px;
  cursor: pointer;
  transition: background 0.2s ease, border 0.2s ease, color 0.2s ease;
  &:hover {
    background: ${({ active }) => (active ? '#f0f0f0' : '#f0f0f0')};
  }
`;

interface FilterDropdownProps {
  label: string;
  options: string[];
  selectedOptions: Set<string>;
  onToggleOption: (option: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, options, selectedOptions, onToggleOption }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options
    .filter(option => option.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownButton onClick={() => setIsOpen(!isOpen)}>
        {label}
        <span>{isOpen ? '▲' : '▼'}</span>
      </DropdownButton>
      <AnimatePresence>
        {isOpen && (
          <DropdownMenu
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <SearchContainer>
              <SearchInput
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchContainer>
            <OptionList>
              {filteredOptions.map((option) => (
                <OptionItem
                  key={option}
                  active={selectedOptions.has(option)}
                  onClick={() => onToggleOption(option)}
                  animate={{ scale: selectedOptions.has(option) ? 1.02 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {option}
                </OptionItem>
              ))}
            </OptionList>
          </DropdownMenu>
        )}
      </AnimatePresence>
    </DropdownContainer>
  );
};

export default FilterDropdown;