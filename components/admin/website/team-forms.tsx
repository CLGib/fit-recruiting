"use client";

import { useActionState, useState } from "react";
import { saveTeamMember, type SaveState } from "@/app/admin/(portal)/website/actions";
import { Field, Input, PrimaryButton, Textarea } from "@/components/admin/field";
import type { TeamMemberRecord } from "@/lib/site/team";

const IDLE: SaveState = { status: "idle" };

type Values = {
  name: string;
  title: string;
  bio: string;
  linkedin: string;
  email: string;
  photo_alt: string;
  visible: boolean;
};

function valuesOf(m: TeamMemberRecord | null): Values {
  return {
    name: m?.name ?? "",
    title: m?.title ?? "",
    bio: m?.bio ?? "",
    linkedin: m?.linkedin ?? "",
    email: m?.email ?? "",
    photo_alt: m?.photo_alt ?? "",
    visible: m?.visible ?? true,
  };
}

/**
 * Add or edit one person.
 *
 * Controlled inputs for the same reason as the page editors: React resets
 * uncontrolled fields when an action finishes, even one that returns a
 * validation error, and a long bio is the worst thing to lose to a typo in the
 * LinkedIn field. The file input is the exception, and should be: clearing it
 * after a save means the next save does not upload the same photo twice.
 */
export default function TeamMemberForm({
  member,
  onDone,
}: {
  member: TeamMemberRecord | null;
  onDone?: () => void;
}) {
  const [v, setV] = useState<Values>(valuesOf(member));
  const [chosen, setChosen] = useState<string | null>(null);
  const [state, action, pending] = useActionState(
    async (prev: SaveState, fd: FormData) => {
      const next = await saveTeamMember(prev, fd);
      if (next.status === "saved") {
        setChosen(null);
        if (!member) {
          // A fresh form for the next person, rather than the last one's details.
          setV(valuesOf(null));
          onDone?.();
        }
      }
      return next;
    },
    IDLE,
  );
  const err = state.errors ?? {};
  const set = (k: keyof Values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setV({ ...v, [k]: e.target.value });

  return (
    <form action={action} className="space-y-5">
      {member && <input type="hidden" name="id" value={member.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" error={err.name}>
          <Input name="name" value={v.name} onChange={set("name")} required maxLength={80} />
        </Field>
        <Field label="Title" hint="As they want it published." error={err.title}>
          <Input name="title" value={v.title} onChange={set("title")} maxLength={80} />
        </Field>
      </div>

      <Field label="Bio" hint="In their own words, two or three sentences." error={err.bio}>
        <Textarea name="bio" rows={5} value={v.bio} onChange={set("bio")} maxLength={1200} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="LinkedIn" hint="Optional. The full address." error={err.linkedin}>
          <Input
            name="linkedin"
            type="url"
            value={v.linkedin}
            onChange={set("linkedin")}
            placeholder="https://www.linkedin.com/in/…"
          />
        </Field>
        <Field label="Email" hint="Optional. Shown as a link on their card." error={err.email}>
          <Input name="email" type="email" value={v.email} onChange={set("email")} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={member?.photo_url ? "Replace the photo" : "Photo"}
          hint="JPG, PNG or WebP, up to 4 MB. A portrait crop works best."
          error={err.photo}
        >
          <input
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setChosen(e.target.files?.[0]?.name ?? null)}
            className="w-full rounded-xl border border-line bg-canvas px-4 py-3 text-[0.9375rem] text-navy file:mr-4 file:rounded-full file:border-0 file:bg-navy file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-canvas hover:file:bg-navy-700"
          />
        </Field>
        <Field
          label="Photo description"
          hint="For people using screen readers. Defaults to their name."
        >
          <Input name="photo_alt" value={v.photo_alt} onChange={set("photo_alt")} maxLength={160} />
        </Field>
      </div>
      {chosen && (
        <p className="text-sm text-body">
          <span className="font-medium text-navy">{chosen}</span> will
          {member?.photo_url ? " replace the current photo" : " be uploaded"} when you save.
        </p>
      )}

      <label className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-body">
        <input
          type="checkbox"
          name="visible"
          checked={v.visible}
          onChange={(e) => setV({ ...v, visible: e.target.checked })}
          className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--color-navy)]"
        />
        <span>
          <span className="font-semibold text-navy">Show on the website.</span> Untick to
          hide someone without losing their details, for example when they leave.
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <PrimaryButton type="submit" disabled={pending}>
          {pending ? "Saving…" : member ? "Save" : "Add to the team"}
        </PrimaryButton>
        <p
          aria-live="polite"
          className={
            state.status === "error"
              ? "text-sm font-medium text-[#8c3225]"
              : "text-sm font-medium text-navy"
          }
        >
          {pending ? "" : state.message ?? ""}
        </p>
      </div>
    </form>
  );
}
