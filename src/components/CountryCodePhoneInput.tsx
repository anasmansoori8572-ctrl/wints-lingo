import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { CountryPhoneCode, POPULAR_COUNTRY_CODES, ALL_COUNTRY_PHONE_CODES } from '../data/countryPhoneCodes';

interface CountryCodePhoneInputProps {
  label: string;
  required?: boolean;
  country: CountryPhoneCode;
  onCountryChange: (country: CountryPhoneCode) => void;
  phoneNumber: string; // 10-digit number
  onPhoneNumberChange: (cleanDigits: string) => void;
  placeholder?: string;
  extraHeaderAction?: React.ReactNode;
  id?: string;
}

export const CountryCodePhoneInput: React.FC<CountryCodePhoneInputProps> = ({
  label,
  required = true,
  country,
  onCountryChange,
  phoneNumber,
  onPhoneNumberChange,
  placeholder = '9876543210',
  extraHeaderAction,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Clean 10-digit formatter
  const handleInputChange = (raw: string) => {
    let digits = raw.replace(/\D/g, '');
    // If user pasted a full number with country code e.g. 919876543210
    const currentDialDigits = country.dialCode.replace(/\D/g, '');
    if (digits.length === 10 + currentDialDigits.length && digits.startsWith(currentDialDigits)) {
      digits = digits.slice(currentDialDigits.length);
    } else if (digits.length === 12 && digits.startsWith('91')) {
      digits = digits.slice(2);
    } else if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    onPhoneNumberChange(digits.slice(0, 10));
  };

  const handleSelectCountry = (selected: CountryPhoneCode) => {
    onCountryChange(selected);
    setIsOpen(false);
    setSearchQuery('');
    phoneInputRef.current?.focus();
  };

  // Filter countries by name or dial code
  const filteredCountries = ALL_COUNTRY_PHONE_CODES.filter((c) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      c.dialCode.includes(query) ||
      c.code.toLowerCase().includes(query)
    );
  });

  const is10Digits = phoneNumber.length === 10;
  const isPartiallyFilled = phoneNumber.length > 0 && phoneNumber.length < 10;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Header Label & Actions */}
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="text-xs font-bold text-slate-700 flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-rose-500">*</span>}
        </label>
        
        <div className="flex items-center gap-2">
          {extraHeaderAction}
          <span
            className={`text-[10px] font-semibold transition-colors ${
              is10Digits
                ? 'text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md'
                : isPartiallyFilled
                ? 'text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md'
                : 'text-slate-400'
            }`}
          >
            {is10Digits ? '✓ 10 digits' : `${phoneNumber.length}/10 digits`}
          </span>
        </div>
      </div>

      {/* Combined Country Code Selector + Number Input */}
      <div
        className={`flex items-center rounded-xl border bg-white transition-all shadow-2xs ${
          is10Digits
            ? 'border-emerald-400 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100'
            : isPartiallyFilled
            ? 'border-amber-400 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100'
            : 'border-slate-200 focus-within:border-[#4A1D96] focus-within:ring-2 focus-within:ring-purple-100'
        }`}
      >
        {/* Country Code Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={`Selected country ${country.name} (${country.dialCode}). Click to change.`}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-l-xl border-r border-slate-200 transition-colors cursor-pointer flex-shrink-0 select-none group"
        >
          <span className="text-base leading-none" role="img" aria-label={country.name}>
            {country.flag}
          </span>
          <span className="text-xs font-bold text-slate-700 group-hover:text-purple-900">
            {country.dialCode}
          </span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-purple-600' : ''}`} />
        </button>

        {/* 10-Digit Phone Number Input */}
        <input
          ref={phoneInputRef}
          id={id}
          type="tel"
          required={required}
          inputMode="numeric"
          maxLength={10}
          pattern="[0-9]{10}"
          value={phoneNumber}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (
              !/[0-9]/.test(e.key) &&
              !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) &&
              !e.ctrlKey &&
              !e.metaKey
            ) {
              e.preventDefault();
            }
          }}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden rounded-r-xl bg-transparent"
        />
      </div>

      {/* Helper message for digits */}
      {isPartiallyFilled && (
        <p className="text-[10px] text-amber-600 font-medium mt-1">
          Must be exactly 10 digits ({10 - phoneNumber.length} more needed)
        </p>
      )}

      {/* Country Code Picker Dropdown Modal */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-80 sm:w-88 max-w-[90vw] bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Dropdown Header & Search */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or code (e.g. +971, UK, USA)..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#4A1D96]"
              />
            </div>
          </div>

          {/* Countries List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
            {/* If not searching, display Popular Countries header */}
            {!searchQuery.trim() && (
              <>
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50/60 sticky top-0 z-10 backdrop-blur-xs">
                  Popular Student Countries
                </div>
                {POPULAR_COUNTRY_CODES.map((item) => (
                  <button
                    key={`popular-${item.code}-${item.dialCode}`}
                    type="button"
                    onClick={() => handleSelectCountry(item)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-purple-50/70 transition-colors cursor-pointer ${
                      country.code === item.code && country.dialCode === item.dialCode
                        ? 'bg-purple-50 font-bold text-purple-900'
                        : 'text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base leading-none">{item.flag}</span>
                      <span className="truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-semibold text-slate-500 text-[11px]">{item.dialCode}</span>
                      {country.code === item.code && country.dialCode === item.dialCode && (
                        <Check className="w-3.5 h-3.5 text-purple-600" />
                      )}
                    </div>
                  </button>
                ))}

                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100/80 sticky top-0 z-10 backdrop-blur-xs">
                  All Countries (A-Z)
                </div>
              </>
            )}

            {/* Filtered or All Countries */}
            {filteredCountries.length > 0 ? (
              filteredCountries.map((item) => (
                <button
                  key={`all-${item.code}-${item.dialCode}`}
                  type="button"
                  onClick={() => handleSelectCountry(item)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-purple-50/70 transition-colors cursor-pointer ${
                    country.code === item.code && country.dialCode === item.dialCode
                      ? 'bg-purple-50 font-bold text-purple-900'
                      : 'text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base leading-none">{item.flag}</span>
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-semibold text-slate-500 text-[11px]">{item.dialCode}</span>
                    {country.code === item.code && country.dialCode === item.dialCode && (
                      <Check className="w-3.5 h-3.5 text-purple-600" />
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching country or code found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
