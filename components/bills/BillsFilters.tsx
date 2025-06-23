'use client';
import React from 'react';

const CATEGORIES = [
  'FOOD',
  'TRANSPORT',
  'MEDICAL',
  'SERVICES',
  'SUBSCRIPTIONS',
  'INSTALLMENTS',
  'ENTERTAINMENT',
  'HOUSEHOLD',
  'EDUCATION',
  'OTHER',
];

interface BillsFiltersProps {
  category: string;
  onCategoryChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
}

export default function BillsFilters({
  category,
  onCategoryChange,
  search,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}: BillsFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-4 items-end">
      <div>
        <label className="mr-2 font-medium">Filtrar por categoría:</label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md"
        >
          <option value="">Todas</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mr-2 font-medium">Buscar:</label>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md"
          placeholder="Proveedor o descripción"
        />
      </div>

      <div>
        <label className="mr-2 font-medium">Desde:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md"
        />
      </div>

      <div>
        <label className="mr-2 font-medium">Hasta:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md"
        />
      </div>
    </div>
  );
}
