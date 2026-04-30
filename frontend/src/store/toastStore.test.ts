import { describe, it, expect, beforeEach } from 'bun:test';
import { useToastStore } from '../store/toastStore';

describe('toastStore', () => {
  beforeEach(() => useToastStore.setState({ toasts: [] }));

  it('should add a toast to the queue', () => {
    useToastStore.getState().add({ type: 'success', message: 'Sucesso!' });
    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0].message).toBe('Sucesso!');
    expect(useToastStore.getState().toasts[0].type).toBe('success');
  });

  it('should generate a unique id for each toast', () => {
    useToastStore.getState().add({ type: 'info', message: 'A' });
    useToastStore.getState().add({ type: 'info', message: 'B' });
    const ids = useToastStore.getState().toasts.map((t) => t.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('should remove a toast by id', () => {
    const id = useToastStore.getState().add({ type: 'error', message: 'Erro!' });
    useToastStore.getState().remove(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('should clear all toasts', () => {
    useToastStore.getState().add({ type: 'success', message: 'A' });
    useToastStore.getState().add({ type: 'error', message: 'B' });
    useToastStore.getState().clear();
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('auto-removes toast after duration', async () => {
    useToastStore.getState().add({ type: 'info', message: 'Timer', duration: 10 });
    expect(useToastStore.getState().toasts).toHaveLength(1);
    await new Promise(r => setTimeout(r, 15));
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});
