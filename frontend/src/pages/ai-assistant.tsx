import { useState } from "react";
import { Sparkles, Send, Bot, User, Lock, CalendarClock, PackageMinus, History, ShieldAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SUGGESTED_PROMPTS: { text: string; icon: LucideIcon }[] = [
  { text: "Which chemicals are expiring in the next 30 days?", icon: CalendarClock },
  { text: "What's low on stock in Lab 2?", icon: PackageMinus },
  { text: "Summarize this week's transactions", icon: History },
  { text: "Flag any chemicals stored incorrectly", icon: ShieldAlert },
];

export function AiAssistantPage() {
  const [draft, setDraft] = useState("");

  return (
    <div className="mx-auto flex h-[calc(100svh-8rem)] max-w-2xl flex-col">
      <div className="mb-5 text-center">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-400 text-white shadow-md shadow-primary/20">
          <Sparkles className="size-6.5" strokeWidth={1.75} />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">AI Assistant</h1>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Ask questions about your inventory in plain language. This assistant isn't wired up yet
          — it's a preview of what's coming.
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden rounded-2xl py-0">
        <CardContent className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-5">
          <div className="flex items-start gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Bot className="size-4" />
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm text-foreground">
              Hi! I'll be able to answer questions about your chemical inventory — stock levels,
              expiring items, safety data, and more. This feature is coming soon and isn't
              connected to live data yet.
            </div>
          </div>

          <div className="flex items-start justify-end gap-2.5 opacity-50">
            <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
              "What chemicals are expiring this month?"
            </div>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <User className="size-4" />
            </div>
          </div>

          <div className="mt-auto grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
            {SUGGESTED_PROMPTS.map(({ text, icon: Icon }) => (
              <button
                key={text}
                type="button"
                disabled
                className="flex cursor-not-allowed items-center gap-2.5 rounded-xl border border-dashed border-border bg-muted/30 px-3.5 py-2.5 text-left text-xs text-muted-foreground transition-colors"
              >
                <Icon className="size-4 shrink-0 text-muted-foreground/70" />
                {text}
              </button>
            ))}
          </div>
        </CardContent>

        <div className="flex items-center gap-2 border-t bg-muted/20 p-3">
          <div className="relative flex-1">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="AI Assistant isn't connected yet…"
              disabled
              className="h-10 rounded-full bg-card pr-9 pl-4"
            />
            <Lock className="pointer-events-none absolute top-1/2 right-3.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
          <Button disabled size="icon" className="size-10 shrink-0 rounded-full" aria-label="Send message">
            <Send className="size-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
