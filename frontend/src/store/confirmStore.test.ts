import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { useConfirmStore } from '../store/confirmStore';

describe('confirmStore', () => {
  beforeEach(() => useConfirmStore.setState({ isOpen: false, onConfirm: null }));

  it('should be closed by default', () => {
    expect(useConfirmStore.getState().isOpen).toBe(false);
  });

  it('should open with message and callback', () => {
    const cb = mock();
    useConfirmStore.getState().open({ title: 'Excluir?', message: 'Tem certeza?', onConfirm: cb });
    expect(useConfirmStore.getState().isOpen).toBe(true);
    expect(useConfirmStore.getState().title).toBe('Excluir?');
    expect(useConfirmStore.getState().message).toBe('Tem certeza?');
  });

  it('should close and clear callback on close()', () => {
    const cb = mock();
    useConfirmStore.getState().open({ title: 'T', message: 'M', onConfirm: cb });
    useConfirmStore.getState().close();
    expect(useConfirmStore.getState().isOpen).toBe(false);
    expect(useConfirmStore.getState().onConfirm).toBeNull();
  });

  it('should execute callback on confirm and close', () => {
    const cb = mock();
    useConfirmStore.getState().open({ title: 'T', message: 'M', onConfirm: cb });
    useConfirmStore.getState().onConfirm?.();
    useConfirmStore.getState().close();
    expect(cb).toHaveBeenCalled();
    expect(useConfirmStore.getState().isOpen).toBe(false);
  });

  it('should set danger flag', () => {
    useConfirmStore.getState().open({ title: 'T', message: 'M', danger: true, onConfirm: mock() });
    expect(useConfirmStore.getState().danger).toBe(true);
  });
});
