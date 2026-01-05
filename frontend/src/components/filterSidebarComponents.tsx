"use client";

import localFont from "next/font/local";
import { IoChevronDown } from "react-icons/io5";
import { useState, useRef, useEffect } from "react";

const PoppinsBold = localFont({ src: "../fonts/Poppins-Bold.ttf" });
const PoppinsRegular = localFont({ src: "../fonts/Poppins-Regular.ttf" });

export interface FilterValues {
  price: string;
  rating: string;
  type: string;
  facilities: string[];
}

interface FilterSidebarProps {
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
}

interface FilterItem {
  key: keyof Omit<FilterValues, "facilities">;
  label: string;
  options: string[];
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openDropdown) {
        const currentRef = dropdownRefs.current[openDropdown];
        if (currentRef && !currentRef.contains(e.target as Node)) {
          setOpenDropdown(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  const handleSelectChange = (
    key: keyof Omit<FilterValues, "facilities">,
    value: string
  ) => {
    onFilterChange({ ...filters, [key]: value });
    setOpenDropdown(null);
  };

  const filterItems: FilterItem[] = [
    {
      key: "price",
      label: "Harga",
      options: ["Semua Harga", "100K - 200K", "> 200K"],
    },
    {
      key: "rating",
      label: "Rating",
      options: ["Semua Rating", "4+", "4.5+", "5"],
    },
    {
      key: "type",
      label: "Jenis",
      options: ["Semua Jenis", "indoor", "outdoor"],
    },
  ];

  const facilityOptions = ["ac", "cafe", "wifi"];

  return (
    <aside className="bg-white p-5 rounded-2xl shadow-xl w-60 h-fit sticky top-10">
      <h2
        className={`text-xl font-bold mb-6 text-gray-600 ${PoppinsBold.className}`}
      >
        Filter
      </h2>

      {/* Dropdown filter */}
      {filterItems.map((item) => (
        <div
          key={item.key}
          className={`mb-5 ${PoppinsRegular.className}`}
          ref={(el) => {
            dropdownRefs.current[item.key] = el || null;
          }}
        >
          <p
            className={`text-sm font-semibold mb-2 text-gray-600 ${PoppinsRegular.className}`}
          >
            {item.label}
          </p>
          <div className="relative w-full select-none">
            <div
              onClick={() =>
                setOpenDropdown(openDropdown === item.key ? null : item.key)
              }
              className={`w-full pl-3 pr-3 py-2 rounded-xl bg-white border border-gray-300/70 text-gray-600 text-[14px] cursor-pointer shadow-[0_2px_6px_rgba(0,0,0,0.05)] flex items-center justify-between ${PoppinsRegular.className}`}
            >
              <span>{filters[item.key]}</span>
              <IoChevronDown
                size={18}
                className={`${openDropdown === item.key ? "rotate-180" : ""}`}
              />
            </div>
            <div
              className={`absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow transition-all duration-300 origin-top z-50 ${
                openDropdown === item.key
                  ? "opacity-100 scale-y-100 pointer-events-auto"
                  : "opacity-0 scale-y-0 pointer-events-none"
              }`}
            >
              {item.options.map((opt) => (
                <div
                  key={opt}
                  onClick={() => handleSelectChange(item.key, opt)}
                  className="px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-green-50 transition"
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Facilities */}
      <div className="mt-4">
        <p
          className={`text-sm font-semibold mb-3 text-gray-700 ${PoppinsRegular.className}`}
        >
          Fasilitas
        </p>

        <div className="flex flex-col gap-2.5">
          {facilityOptions.map((fac) => {
            const label = fac.charAt(0).toUpperCase() + fac.slice(1);
            const isChecked = filters.facilities.includes(fac);

            return (
              <label
                key={fac}
                className={`flex items-center gap-2 cursor-pointer text-gray-700 text-[14px] ${PoppinsRegular.className}`}
              >
                {/* Hidden Checkbox */}
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() =>
                    onFilterChange({
                      ...filters,
                      facilities: isChecked
                        ? filters.facilities.filter((f) => f !== fac)
                        : [...filters.facilities, fac],
                    })
                  }
                  className="hidden"
                />

                {/* Custom Circle (Mini Size) */}
                <span
                  className={`w-4 h-4 rounded-full border-[2px] flex items-center justify-center transition-all 
              ${isChecked ? "border-green-600" : "border-gray-400"}`}
                >
                  {/* Dot inside */}
                  {isChecked && (
                    <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
                  )}
                </span>

                {label}
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
