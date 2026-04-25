"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Profile = {
  full_name?: string | null;
  major?: string | null;
  gpa?: number | null;
  grad_year?: number | null;
  resume_text?: string | null;
};

type ActionState = { error?: string; success?: boolean } | null;

export function ProfileForm({
  profile,
  action,
}: {
  profile: Profile | null;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.success && (
        <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-sm text-zinc-100">
          Profile saved — Quad will use this context in every conversation.
        </div>
      )}
      {state?.error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {state.error}
        </div>
      )}

      {profile?.full_name && (
        <div className="space-y-1">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Name (from your university account)</p>
          <p className="text-sm text-zinc-300">{profile.full_name}</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="major" className="block text-sm text-zinc-400">
          Major
        </label>
        <Input
          id="major"
          name="major"
          defaultValue={profile?.major ?? ""}
          placeholder="Computer Science"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="gpa" className="block text-sm text-zinc-400">
            GPA
          </label>
          <Input
            id="gpa"
            name="gpa"
            type="number"
            step="0.01"
            min="0"
            max="4.0"
            defaultValue={profile?.gpa ?? ""}
            placeholder="3.8"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="grad_year" className="block text-sm text-zinc-400">
            Graduation Year
          </label>
          <Input
            id="grad_year"
            name="grad_year"
            type="number"
            min="2024"
            max="2035"
            defaultValue={profile?.grad_year ?? ""}
            placeholder="2027"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="resume_text" className="block text-sm text-zinc-400">
          Resume/Experience Context{" "}
          <span className="text-zinc-600">(Optional)</span>
        </label>
        <p className="text-xs text-zinc-600">
          Paste your raw resume text here so Quad can help with career advice.
        </p>
        <textarea
          id="resume_text"
          name="resume_text"
          defaultValue={profile?.resume_text ?? ""}
          placeholder="3.8 GPA · ACM chapter lead · built a full-stack project tracker · internship at IBM..."
          rows={8}
          className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full py-2.5">
        {isPending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
