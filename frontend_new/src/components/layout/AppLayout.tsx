import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useInventory } from '../../contexts/InventoryContext';

export function AppLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const { alerts } = useInventory();
  const location = useLocation();
  const openAlerts = alerts.filter((a) => !a.acknowledged).length;

  React.useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-full w-full bg-slate-50">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64">
          <Sidebar openAlerts={openAlerts} />
        </div>
      </aside>

      <AnimatePresence>
        {navOpen &&
        <>
            <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-40 bg-navy-950/50 lg:hidden"
            onClick={() => setNavOpen(false)} />
          
            <motion.div
            key="drawer"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            role="dialog"
            aria-label="Navigation">
            
              <Sidebar
              openAlerts={openAlerts}
              onNavigate={() => setNavOpen(false)}
              onClose={() => setNavOpen(false)} />
            
            </motion.div>
          </>
        }
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar openAlerts={openAlerts} onOpenNav={() => setNavOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>);

}