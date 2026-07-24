/**
 * Safe mailto: URL builder — sanitizes header-injection vectors and encodes
 * every field independently. Callers that need to interpolate user or tenant
 * data into subject/body should route through here rather than concatenating
 * strings by hand.
 */

export function sanitizeMailField(v: string): string {
  return v.replace(/[\r\n]+/g, " ");
}

export function buildMailto({
  to,
  subject,
  body
}: {
  to: string;
  subject: string;
  body: string;
}): string {
  const cleanSubject = sanitizeMailField(subject);
  const cleanBody = body.replace(/\r/g, "");
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
    cleanSubject
  )}&body=${encodeURIComponent(cleanBody)}`;
}
