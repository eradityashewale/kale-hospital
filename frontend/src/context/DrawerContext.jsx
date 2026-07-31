import { createContext, useContext, useCallback, useState } from 'react';

const DrawerContext = createContext(null);

export function DrawerProvider({ children }) {
  const [drawer, setDrawer] = useState(null); // { title, render }

  const closeDrawer = useCallback(() => setDrawer(null), []);
  const openDrawer = useCallback((title, render) => setDrawer({ title, render }), []);

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer, isOpen: !!drawer }}>
      {children}
      {drawer && (
        <div className="drawer-backdrop" onClick={(e) => { if (e.target === e.currentTarget) closeDrawer(); }}>
          <aside className="drawer-panel" role="dialog" aria-modal="true">
            <div className="drawer-header">
              <h3>{drawer.title}</h3>
              <button className="icon-btn" type="button" onClick={closeDrawer}>✕</button>
            </div>
            <div className="drawer-body">
              {drawer.render(closeDrawer)}
            </div>
          </aside>
        </div>
      )}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useDrawer must be used within DrawerProvider');
  return ctx;
}
