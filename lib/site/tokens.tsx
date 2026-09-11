import { Fragment, type ReactNode } from "react";

/**
 * Render copy that contains {placeholders} for things like a phone link.
 *
 * "Email {email} or call {phone}." becomes the sentence with real links in
 * it. The words stay plain text, so nothing Fit types is ever interpreted as
 * HTML, and an unknown {word} is left as typed rather than vanishing.
 */
export function withTokens(text: string, tokens: Record<string, ReactNode>): ReactNode {
  return text.split(/(\{[a-z]+\})/g).map((part, i) => {
    const key = /^\{([a-z]+)\}$/.exec(part)?.[1];
    return <Fragment key={i}>{key && key in tokens ? tokens[key] : part}</Fragment>;
  });
}
