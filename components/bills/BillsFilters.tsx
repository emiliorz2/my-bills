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
        <label htmlFor="filter-category" className="mr-2 font-medium">Filtrar por categoría:</label>
        <select
          id="filter-category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="input"
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
        <label htmlFor="filter-search" className="mr-2 font-medium">Buscar:</label>
        <input
          id="filter-search"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input"
          placeholder="Proveedor o descripción"
        />
      </div>

      <div>
        <label htmlFor="filter-from" className="mr-2 font-medium">Desde:</label>
        <input
          id="filter-from"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="input"
        />
      </div>

      <div>
        <label htmlFor="filter-to" className="mr-2 font-medium">Hasta:</label>
        <input
          id="filter-to"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="input"
        />
      </div>
    </div>
  );
}
