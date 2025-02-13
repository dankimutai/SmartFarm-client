import { useState, useRef, useEffect, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { RiArrowDownSLine } from 'react-icons/ri';

interface DropdownItem {
  label: string;
  link: string;
}

interface DropdownMenuProps {
  title: ReactNode;  // Changed from string to ReactNode
  items: DropdownItem[];
}

export const DropdownMenu = ({ title, items }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-gray-700 hover:text-emerald-600 transition-colors"
      >
        {title}
        <RiArrowDownSLine className="ml-1" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 py-2 w-48 bg-white rounded-lg shadow-lg">
          {items.map((item) => (
            <Link
              key={item.link}
              to={item.link}
              className="block px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};