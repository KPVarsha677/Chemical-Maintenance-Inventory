import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BellIcon,
  BoxesIcon,
  CalendarClockIcon,
  FlaskConicalIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  LogOutIcon,
  ScrollTextIcon,
  SparklesIcon,
  XIcon } from
'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  openAlerts: number;
  onNavigate?: () => void;
  onClose?: () => void;
}

const primaryNav = [
{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon, end: true },
{ to: '/inventory', label: 'Inventory', icon: BoxesIcon, end: false },
{ to: '/transactions', label: 'Transactions', icon: ScrollTextIcon, end: false }];


export function Sidebar({ openAlerts, onNavigate, onClose }: SidebarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    onNavigate?.();
    navigate('/', { replace: true });
  }

  const linkClass = ({ isActive }: {isActive: boolean;}) =>
  [
  'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ease-out',
  isActive ?
  'bg-white/10 text-white' :
  'text-navy-200 hover:bg-white/5 hover:text-white'].
  join(' ');

  return (
    <div className="flex h-full flex-col bg-navy-950">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600">
          <FlaskConicalIcon className="h-4 w-4 text-white" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-white">
            Reagentia
          </p>
          <p className="truncate text-2xs uppercase tracking-widest text-navy-300">
            Chemical Inventory
          </p>
        </div>
        {onClose &&
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded-md p-1.5 text-navy-300 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close navigation">
          
            <XIcon className="h-4 w-4" />
          </button>
        }
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 thin-scroll" aria-label="Main">
        <p className="px-3 pb-2 text-2xs font-semibold uppercase tracking-widest text-navy-400">
          Operations
        </p>
        <ul className="space-y-0.5">
          {primaryNav.map(({ to, label, icon: Icon, end }) =>
          <li key={to}>
              <NavLink to={to} end={end} className={linkClass} onClick={onNavigate}>
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          )}
        </ul>

        <p className="px-3 pb-2 pt-6 text-2xs font-semibold uppercase tracking-widest text-navy-400">
          Safety &amp; Support
        </p>
        <ul className="space-y-0.5">
          <li>
            <NavLink to="/alerts" className={linkClass} onClick={onNavigate}>
              <BellIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              Alerts
              {openAlerts > 0 &&
              <span className="ml-auto rounded-full bg-rose-500/90 px-1.5 py-0.5 text-2xs font-semibold tabular text-white">
                  {openAlerts}
                </span>
              }
            </NavLink>
          </li>
          <li>
            <NavLink to="/expiry-first" className={linkClass} onClick={onNavigate}>
              <CalendarClockIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              Expiry First
            </NavLink>
          </li>
          <li>
            <NavLink to="/assistant" className={linkClass} onClick={onNavigate}>
              <SparklesIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              AI Assistant
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <a
          href="#"
          className="mb-2 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-navy-300 transition-colors duration-150 ease-out hover:bg-white/5 hover:text-white">
          
          <LifeBuoyIcon className="h-4 w-4" aria-hidden="true" />
          Help &amp; SDS library
        </a>
        <div className="flex items-center gap-3 rounded-md bg-white/5 px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-semibold text-brand-200">
            {user?.initials ?? '—'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{user?.fullName ?? 'Signed out'}</p>
            <p className="truncate text-2xs text-navy-300">{user?.email ?? ''}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="shrink-0 rounded-md p-1.5 text-navy-300 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white"
            aria-label="Sign out">

            <LogOutIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>);

}