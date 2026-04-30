import { useState, useMemo, useCallback } from 'react';

interface FilterOptions {
  pageSize?: number;
  searchKeys?: string[];
}

export function useFilteredData<T extends Record<string, any>>(
  data: T[],
  options: FilterOptions = {}
) {
  const { pageSize: initialPageSize = 20, searchKeys = ['name', 'model', 'email', 'serial', 'tagNumber'] } = options;

  const [search, setSearchRaw] = useState('');
  const [type, setTypeRaw] = useState('');
  const [status, setStatusRaw] = useState('');
  const [location, setLocationRaw] = useState('');
  const [department, setDepartmentRaw] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeRaw] = useState(initialPageSize);

  const withReset = (setter: (v: string) => void) =>
    (v: string) => { setter(v); setPage(1); };

  const setSearch = useCallback(withReset(setSearchRaw), []);
  const setType = useCallback(withReset(setTypeRaw), []);
  const setStatus = useCallback(withReset(setStatusRaw), []);
  const setLocation = useCallback(withReset(setLocationRaw), []);
  const setDepartment = useCallback(withReset(setDepartmentRaw), []);
  const setPageSize = useCallback((n: number) => { setPageSizeRaw(n); setPage(1); }, []);

  const reset = useCallback(() => {
    setSearchRaw(''); setTypeRaw(''); setStatusRaw(''); setLocationRaw(''); setDepartmentRaw(''); setPage(1);
  }, []);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchSearch = !search || searchKeys.some((k) =>
        String(item[k] ?? '').toLowerCase().includes(search.toLowerCase())
      );
      const matchType = !type || item.type === type;
      const matchStatus = !status || item.status === status;
      const matchLocation = !location || item.locationId === location;
      const matchDepartment = !department || item.departmentId === department;
      return matchSearch && matchType && matchStatus && matchLocation && matchDepartment;
    });
  }, [data, search, type, status, location, department, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  return {
    filtered, paginated, page: safePage, totalPages,
    search, type, status, location, department,
    pageSize, setPageSize,
    setSearch, setType, setStatus, setLocation, setDepartment, setPage, reset,
  };
}
