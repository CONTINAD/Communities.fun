"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addRule, deleteRule } from "@/actions/community";
import { X, Plus, Loader2 } from "lucide-react";

interface Rule {
  id: string;
  title: string;
  description: string | null;
  order: number;
}

interface RulesManagerProps {
  communityId: string;
  initialRules: Rule[];
}

export default function RulesManager({
  communityId,
  initialRules,
}: RulesManagerProps) {
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAdding, startAddTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleAdd() {
    if (!title.trim()) return;
    setError(null);

    startAddTransition(async () => {
      const result = await addRule(communityId, title.trim(), description.trim());

      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }

      setTitle("");
      setDescription("");
      setShowForm(false);
      router.refresh();
    });
  }

  async function handleDelete(ruleId: string) {
    setDeletingId(ruleId);
    setError(null);

    try {
      const result = await deleteRule(ruleId, communityId);

      if ("error" in result && result.error) {
        setError(result.error);
        setDeletingId(null);
        return;
      }

      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      setDeletingId(null);
      router.refresh();
    } catch {
      setError("Failed to delete rule.");
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Existing rules */}
      {rules.length === 0 ? (
        <p className="text-sm text-text-secondary">
          No rules yet. Add rules to help members understand what is expected.
        </p>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-start gap-3 rounded-lg border border-border-primary bg-bg-secondary p-3"
            >
              {/* Order number */}
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg-tertiary text-xs font-bold text-text-secondary">
                {rule.order}
              </span>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium text-text-primary">
                  {rule.title}
                </p>
                {rule.description && (
                  <p className="mt-0.5 text-sm text-text-secondary">
                    {rule.description}
                  </p>
                )}
              </div>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleDelete(rule.id)}
                disabled={deletingId === rule.id}
                className="shrink-0 rounded-full p-1 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
              >
                {deletingId === rule.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <X size={16} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add rule form */}
      {showForm ? (
        <div className="space-y-3 rounded-lg border border-border-primary bg-bg-secondary p-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Rule Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Be respectful"
              maxLength={100}
              className="w-full rounded-lg border border-border-primary bg-bg-primary px-3 py-2 text-[15px] text-text-primary placeholder-text-secondary outline-none transition-colors focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the rule in more detail..."
              rows={2}
              maxLength={280}
              className="w-full resize-none rounded-lg border border-border-primary bg-bg-primary px-3 py-2 text-[15px] text-text-primary placeholder-text-secondary outline-none transition-colors focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!title.trim() || isAdding}
              className="rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-white transition-colors hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isAdding ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin" />
                  Adding...
                </span>
              ) : (
                "Add Rule"
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setTitle("");
                setDescription("");
              }}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 rounded-full border border-border-primary px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
        >
          <Plus size={16} />
          Add Rule
        </button>
      )}
    </div>
  );
}
