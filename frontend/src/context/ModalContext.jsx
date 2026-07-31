import { createContext, useContext, useCallback, useState } from 'react';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null); // { title, render }

  const closeModal = useCallback(() => setModal(null), []);
  const openModal = useCallback((title, render) => setModal({ title, render }), []);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modal && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-card" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h3>{modal.title}</h3>
              <button className="icon-btn" type="button" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {modal.render(closeModal)}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}
