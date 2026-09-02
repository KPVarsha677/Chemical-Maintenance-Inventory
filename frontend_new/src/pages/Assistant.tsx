import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpIcon, DatabaseIcon, SparklesIcon, UserIcon } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Panel, PanelHeader } from '../components/ui/Panel';
import { Badge } from '../components/ui/Badge';
import { useInventory } from '../contexts/InventoryContext';
import { Chemical } from '../types/inventory';
import {
  daysUntil,
  formatCurrency,
  formatDate,
  formatQuantity,
  getExpiryState,
  getStockState,
  totalValue } from
'../utils/inventory';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  sources?: string[];
}

const suggestions = [
'What needs reordering this week?',
'Which lots expire before the end of September?',
'Where is the sulfuric acid stored?',
'Summarise solvent consumption this month'];


function buildAnswer(question: string, chemicals: Chemical[]): Message {
  const q = question.toLowerCase();
  const low = chemicals.filter((c) => getStockState(c) !== 'in-stock');
  const expiring = chemicals.
  filter((c) => getExpiryState(c) !== 'valid').
  sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate));

  if (q.includes('reorder') || q.includes('low') || q.includes('stock')) {
    return {
      id: Date.now(),
      role: 'assistant',
      text: `${low.length} items are at or below their reorder point:\n\n${low.
      map(
        (c) =>
        `• ${c.name} — ${formatQuantity(c.quantity, c.unit)} on hand against a ${formatQuantity(
          c.minQuantity,
          c.unit
        )} minimum (${c.location}, custodian ${c.custodian})`
      ).
      join(
        '\n'
      )}\n\nHydrochloric Acid is the most urgent: it is fully depleted and three open projects list it as required. Acetonitrile has a three-week lead time, so raise that purchase order in the same batch.`,
      sources: low.slice(0, 4).map((c) => c.id)
    };
  }

  if (q.includes('expir') || q.includes('september') || q.includes('shelf')) {
    return {
      id: Date.now(),
      role: 'assistant',
      text: `${expiring.length} lots need attention before end of September:\n\n${expiring.
      map((c) => {
        const d = daysUntil(c.expiryDate);
        return `• ${c.name} (lot ${c.lotNumber}) — ${
        d < 0 ? `expired ${Math.abs(d)} days ago` : `expires in ${d} days`} on ${
        formatDate(c.expiryDate)}`;
      }).
      join(
        '\n'
      )}\n\nFormaldehyde 37% is already past expiry and should be quarantined today. Toluene also has an overdue peroxide test, so complete that check before any further dispense.`,
      sources: expiring.slice(0, 4).map((c) => c.id)
    };
  }

  if (q.includes('where') || q.includes('locat') || q.includes('stored')) {
    const match = chemicals.find((c) => q.includes(c.name.toLowerCase().split(' ')[0]));
    if (match) {
      return {
        id: Date.now(),
        role: 'assistant',
        text: `${match.name} is held in ${match.location} under: ${match.storage}. Current holding is ${formatQuantity(
          match.quantity,
          match.unit
        )} across ${match.containerCount} containers, custodian ${match.custodian}.${
        match.notes ? `\n\nHandling note: ${match.notes}` : ''}`,

        sources: [match.id]
      };
    }
  }

  if (q.includes('value') || q.includes('cost') || q.includes('spend')) {
    return {
      id: Date.now(),
      role: 'assistant',
      text: `Total register value is ${formatCurrency(
        totalValue(chemicals)
      )} at last purchase price across ${chemicals.length} catalogue items. Silver Nitrate alone accounts for the largest per-unit exposure at ${formatCurrency(
        412
      )} per kg, and solvents represent the highest recurring spend.`,
      sources: ['CHM-1101', 'CHM-1107']
    };
  }

  if (q.includes('solvent') || q.includes('consumption') || q.includes('usage')) {
    return {
      id: Date.now(),
      role: 'assistant',
      text: `Solvent draw in August totalled 151 units against 172 received, so net position improved. Ethanol and Acetone accounted for roughly 60% of dispensing, driven by extraction runs on PRJ-4410 and glassware cleaning in Lab B. Acetone is nonetheless below its 10 L minimum because the last receipt was in May.`,
      sources: ['CHM-1063', 'CHM-1043']
    };
  }

  return {
    id: Date.now(),
    role: 'assistant',
    text: `I can answer questions grounded in the live register — ${chemicals.length} catalogue items, ${low.length} stock exceptions and ${expiring.length} shelf-life exceptions right now. Try asking about reorder priorities, expiring lots, storage locations, custodians or consumption trends.`
  };
}

export function Assistant() {
  const { chemicals } = useInventory();
  const [messages, setMessages] = useState<Message[]>([
  {
    id: 1,
    role: 'assistant',
    text: 'I have read access to the chemical register, transaction log and open alerts. Ask about stock cover, expiry risk, storage locations or consumption patterns and I will cite the records I used.'
  }]
  );
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const timer = useRef<number>();

  const ask = (question: string) => {
    if (!question.trim() || thinking) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: question }]);
    setInput('');
    setThinking(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setMessages((prev) => [...prev, buildAnswer(question, chemicals)]);
      setThinking(false);
    }, 700);
  };

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const stats = useMemo(
    () => ({
      items: chemicals.length,
      low: chemicals.filter((c) => getStockState(c) !== 'in-stock').length,
      expiring: chemicals.filter((c) => getExpiryState(c) !== 'valid').length
    }),
    [chemicals]
  );

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <PageHeader
        eyebrow="Assistant"
        title="Inventory intelligence"
        description="Ask questions about the register in plain language. Answers are grounded in current stock, movements and alerts." />
      

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel className="flex h-[640px] flex-col xl:col-span-2">
          <PanelHeader
            title="Conversation"
            description="Session started 31 Aug 2026"
            action={<Badge tone="success" dot>Connected to register</Badge>} />
          
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 thin-scroll">
            {messages.map((m) =>
            <div key={m.id} className="flex gap-3">
                <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                m.role === 'assistant' ?
                'bg-brand-600 text-white' :
                'bg-slate-200 text-navy-700'}`
                }>
                
                  {m.role === 'assistant' ?
                <SparklesIcon className="h-3.5 w-3.5" aria-hidden="true" /> :

                <UserIcon className="h-3.5 w-3.5" aria-hidden="true" />
                }
                </span>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-2xs font-semibold uppercase tracking-widest text-slate-400">
                    {m.role === 'assistant' ? 'Assistant' : 'Dr. Elena Vasquez'}
                  </p>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-navy-800">
                    {m.text}
                  </p>
                  {m.sources && m.sources.length > 0 &&
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-2xs uppercase tracking-widest text-slate-400">
                        Sources
                      </span>
                      {m.sources.map((s) =>
                  <Link
                    key={s}
                    to={`/inventory/${s}`}
                    className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-2xs text-slate-600 transition-colors duration-150 ease-out hover:border-brand-300 hover:text-brand-700">
                    
                          {s}
                        </Link>
                  )}
                    </div>
                }
                </div>
              </div>
            )}
            {thinking &&
            <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-600 text-white">
                  <SparklesIcon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="flex items-center gap-1 pt-2" aria-live="polite">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
                </div>
              </div>
            }
          </div>

          <form
            className="border-t border-slate-200 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}>
            
            <div className="flex items-end gap-2">
              <label className="sr-only" htmlFor="assistant-input">
                Ask the assistant
              </label>
              <textarea
                id="assistant-input"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    ask(input);
                  }
                }}
                placeholder="Ask about stock cover, expiry risk, locations or usage…"
                className="min-h-[56px] flex-1 resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-navy-900 placeholder:text-slate-400 transition-colors duration-150 ease-out focus:border-brand-500 focus:outline-none" />
              
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-600 text-white transition-colors duration-150 ease-out hover:bg-brand-700 disabled:opacity-40"
                aria-label="Send question">
                
                <ArrowUpIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-2xs text-slate-400">
              Answers are generated from mock register data and are not a substitute for the SDS.
            </p>
          </form>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <PanelHeader title="Suggested questions" />
            <ul className="p-3">
              {suggestions.map((s) =>
              <li key={s}>
                  <button
                  type="button"
                  onClick={() => ask(s)}
                  className="w-full rounded-md px-3 py-2.5 text-left text-sm text-navy-800 transition-colors duration-150 ease-out hover:bg-slate-100">
                  
                    {s}
                  </button>
                </li>
              )}
            </ul>
          </Panel>

          <Panel>
            <PanelHeader
              title="Context in scope"
              description="Records the assistant can read" />
            
            <ul className="divide-y divide-slate-200 text-sm">
              {[
              { label: 'Catalogue items', value: stats.items },
              { label: 'Stock exceptions', value: stats.low },
              { label: 'Shelf-life exceptions', value: stats.expiring }].
              map((row) =>
              <li key={row.label} className="flex items-center justify-between px-5 py-3">
                  <span className="flex items-center gap-2 text-slate-600">
                    <DatabaseIcon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    {row.label}
                  </span>
                  <span className="tabular font-medium text-navy-900">{row.value}</span>
                </li>
              )}
            </ul>
          </Panel>
        </div>
      </div>
    </div>);

}