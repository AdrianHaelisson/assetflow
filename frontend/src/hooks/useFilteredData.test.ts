import '../test/setup';
import { describe, it, expect } from 'bun:test';
import { renderHook, act } from '@testing-library/react';
import { useFilteredData } from '../hooks/useFilteredData';

const items = [
  { id: '1', name: 'MacBook Pro', type: 'NOTEBOOK', status: 'IN_USE', locationId: 'loc-sp' },
  { id: '2', name: 'Dell Desktop', type: 'DESKTOP', status: 'AVAILABLE', locationId: 'loc-rj' },
  { id: '3', name: 'iPad Pro', type: 'TABLET', status: 'IN_USE', locationId: 'loc-sp' },
  { id: '4', name: 'Servidor Dell', type: 'SERVER', status: 'MAINTENANCE', locationId: 'loc-dc' },
  { id: '5', name: 'MacBook Air', type: 'NOTEBOOK', status: 'AVAILABLE', locationId: 'loc-rj' },
];

describe('useFilteredData', () => {
  it('returns all items when no filters applied', () => {
    const { result } = renderHook(() => useFilteredData(items));
    expect(result.current.filtered).toHaveLength(5);
  });

  it('filters by search term (name)', () => {
    const { result } = renderHook(() => useFilteredData(items));
    act(() => result.current.setSearch('macbook'));
    expect(result.current.filtered).toHaveLength(2);
    expect(result.current.filtered.every(i => i.name.toLowerCase().includes('macbook'))).toBe(true);
  });

  it('filters by type', () => {
    const { result } = renderHook(() => useFilteredData(items));
    act(() => result.current.setType('NOTEBOOK'));
    expect(result.current.filtered).toHaveLength(2);
  });

  it('filters by status', () => {
    const { result } = renderHook(() => useFilteredData(items));
    act(() => result.current.setStatus('AVAILABLE'));
    expect(result.current.filtered).toHaveLength(2);
  });

  it('combines multiple filters', () => {
    const { result } = renderHook(() => useFilteredData(items));
    act(() => { result.current.setType('NOTEBOOK'); result.current.setStatus('IN_USE'); });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].name).toBe('MacBook Pro');
  });

  it('paginates correctly with page size 2', () => {
    const { result } = renderHook(() => useFilteredData(items, { pageSize: 2 }));
    expect(result.current.paginated).toHaveLength(2);
    expect(result.current.totalPages).toBe(3);
  });

  it('resets to page 1 when filter changes', () => {
    const { result } = renderHook(() => useFilteredData(items, { pageSize: 2 }));
    act(() => result.current.setPage(2));
    expect(result.current.page).toBe(2);
    act(() => result.current.setSearch('mac'));
    expect(result.current.page).toBe(1);
  });

  it('resets all filters', () => {
    const { result } = renderHook(() => useFilteredData(items));
    act(() => { result.current.setSearch('mac'); result.current.setType('NOTEBOOK'); });
    act(() => result.current.reset());
    expect(result.current.filtered).toHaveLength(5);
  });
});
