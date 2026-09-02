import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BellIcon, MenuIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface TopbarProps {
  openAlerts: number;
  onOpenNav: () => void;
}

export function Topbar({ openAlerts, onOpenNav }: TopbarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onOpenNav}
        className="rounded-md p-2 text-navy-600 transition-colors duration-150 ease-out hover:bg-slate-100 lg:hidden"
        aria-label="Open navigation">
        
        <MenuIcon className="h-5 w-5" />
      </button>

      <form
        className="relative flex-1 max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          navigate(`/inventory?q=${encodeURIComponent(query)}`);
        }}
        role="search">
        
        <SearchIcon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true" />
        
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          placeholder="Search chemicals, CAS numbers, lots…"
          aria-label="Search inventory"
          className="h-9 w-full rounded-md border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm text-navy-900 placeholder:text-slate-400 transition-colors duration-150 ease-out focus:border-brand-500 focus:bg-white focus:outline-none" />
        
      </form>

      <div className="ml-auto flex items-center gap-2">
        <Link
          to="/alerts"
          className="relative rounded-md p-2 text-navy-600 transition-colors duration-150 ease-out hover:bg-slate-100"
          aria-label={`Alerts, ${openAlerts} open`}>
          
          <BellIcon className="h-5 w-5" />
          {openAlerts > 0 &&
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-2xs font-semibold tabular text-white">
              {openAlerts}
            </span>
          }
        </Link>
        <Button variant="primary" onClick={() => navigate('/inventory/new')}>
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Add chemical</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </header>);

}