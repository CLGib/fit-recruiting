"use client";

import { useActionState } from "react";
import { publishToBullhorn, type PublishState } from "@/app/admin/(portal)/roles/actions";
import { CHANNELS, type ChannelKey } from "@/lib/admin/role-status";
import type { Role } from "@/lib/admin/roles";

const INITIAL: PublishState = { status: "idle" };

function when(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type ChannelState = {
  live: boolean;
  detail: string;
  /** False when the deployment genuinely cannot reach this channel yet. */
  connected: boolean;
};

function channelState(
  key: ChannelKey,
  role: Role,
  bullhornConnected: boolean,
): ChannelState {
  if (key === "site") {
    const at = when(role.site_published_at);
    return {
      connected: true,
      live: role.status === "open",
      detail:
        role.status === "open"
          ? at
            ? `Live since ${at}`
            : "Live"
          : role.status === "draft"
            ? "Set the role to Open to put it on the site"
            : "Closed, so it is off the site",
    };
  }

  if (key === "bullhorn") {
    if (!bullhornConnected) {
      return {
        connected: false,
        live: false,
        detail: "Not connected. Bullhorn issues API credentials through a support ticket.",
      };
    }
    const at = when(role.bullhorn_synced_at);
    return {
      connected: true,
      live: Boolean(role.bullhorn_job_order_id),
      detail: role.bullhorn_job_order_id
        ? `Job order ${role.bullhorn_job_order_id}${at ? `, sent ${at}` : ""}`
        : "Not sent yet",
    };
  }

  // LinkedIn rides on Bullhorn's connection rather than one of our own.
  if (!bullhornConnected) {
    return {
      connected: false,
      live: false,
      detail: "Goes out through Bullhorn, so it needs Bullhorn connected first.",
    };
  }
  const at = when(role.linkedin_synced_at);
  return {
    connected: true,
    live: Boolean(role.linkedin_urn),
    detail: role.linkedin_urn ? `Posted${at ? ` ${at}` : ""}` : "Not posted yet",
  };
}

export default function PublishPanel({
  role,
  bullhornConnected,
}: {
  role: Role;
  bullhornConnected: boolean;
}) {
  const [state, action, pending] = useActionState(publishToBullhorn, INITIAL);

  return (
    <section
      aria-labelledby="publish-heading"
      className="rounded-[1.75rem] border border-line-soft bg-canvas-warm/60 p-7"
    >
      <h2 id="publish-heading" className="eyebrow mb-5">
        Where this role goes
      </h2>

      <ul className="space-y-4">
        {CHANNELS.map((channel) => {
          const s = channelState(channel.key, role, bullhornConnected);
          return (
            <li key={channel.key} className="border-b border-line pb-4 last:border-0 last:pb-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-semibold text-navy">{channel.label}</p>
                <span
                  className={
                    s.live
                      ? "shrink-0 rounded-full bg-gold/25 px-3 py-1 text-xs font-semibold text-navy-700"
                      : "shrink-0 rounded-full border border-line px-3 py-1 text-xs font-medium text-body"
                  }
                >
                  {s.live ? "Live" : s.connected ? "Not sent" : "Not connected"}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-body">{s.detail}</p>
            </li>
          );
        })}
      </ul>

      <form action={action} className="mt-6">
        <input type="hidden" name="id" value={role.id} />
        <button
          type="submit"
          disabled={pending || !bullhornConnected}
          className="w-full rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-canvas transition-all hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send to Bullhorn and LinkedIn"}
        </button>
      </form>

      {state.status === "error" && state.message && (
        <p className="mt-3 text-sm leading-relaxed text-[#8c3225]" role="alert">
          {state.message}
        </p>
      )}

      {!bullhornConnected && (
        // Said out loud on the screen, because this is the one thing Fit has to
        // go and get, and it is the longest lead time on the project.
        <p className="mt-5 border-t border-line pt-5 text-xs leading-relaxed text-body">
          To turn this on, Fit needs an API user from Bullhorn with write access
          to job orders. It is requested through a Bullhorn support ticket by
          someone with Client Admin permission on the account.
        </p>
      )}
    </section>
  );
}
