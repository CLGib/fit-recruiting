/** Form primitives shared by the portal's editing screens. */

const BASE =
  "w-full rounded-xl border border-line bg-canvas px-4 py-3 text-[0.9375rem] text-navy placeholder:text-body focus:border-navy focus:outline-none";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* An implicit label: wrapping the control means no id has to be threaded
          through every caller, and every field is labelled by construction
          rather than by whoever remembered. The hint and error sit OUTSIDE the
          label so they are not read as part of the field's name. */}
      <label className="block">
        <span className="eyebrow mb-2 block">{label}</span>
        {children}
      </label>
      {hint && !error && <p className="mt-1.5 text-xs text-body">{hint}</p>}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-[#8c3225]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input(props: React.ComponentProps<"input">) {
  return <input {...props} className={`${BASE} ${props.className ?? ""}`} />;
}

export function Textarea(props: React.ComponentProps<"textarea">) {
  return (
    <textarea {...props} className={`${BASE} leading-relaxed ${props.className ?? ""}`} />
  );
}

export function Select(props: React.ComponentProps<"select">) {
  return (
    <select {...props} className={`${BASE} font-medium ${props.className ?? ""}`}>
      {props.children}
    </select>
  );
}

export function PrimaryButton({
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-canvas transition-all hover:bg-navy-700 disabled:opacity-60 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3.5 text-sm font-semibold text-navy transition-all hover:border-navy hover:bg-navy hover:text-canvas disabled:opacity-60 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}
