import { Link, Text } from "@react-email/components";
import {
  FallbackLink,
  Heading,
  Paragraph,
  SmallText,
  ZivvyButton,
  ZivvyLayout,
} from "./components";

interface NotificationEmailProps {
  subject: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
  doctype?: string;
  docname?: string;
}

export default function NotificationEmail({
  subject = "New notification",
  message = "You have a new notification in Zivvy.",
  ctaLabel,
  ctaUrl,
  doctype,
  docname,
}: NotificationEmailProps) {
  const docRef = doctype && docname ? `${doctype}: ${docname}` : undefined;

  return (
    <ZivvyLayout preview={message.slice(0, 120)}>
      <Heading>{subject}</Heading>
      <Paragraph>{message}</Paragraph>

      {docRef && (
        <Text
          style={{
            fontSize: "13px",
            color: "#888888",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
            margin: "0 0 16px",
            padding: "12px 16px",
            backgroundColor: "#F7F7F8",
            borderRadius: "8px",
            border: "1px solid #E5E5E5",
          }}
        >
          <Text
            style={{
              fontSize: "11px",
              textTransform: "uppercase" as const,
              letterSpacing: "0.05em",
              color: "#888888",
              fontWeight: 600,
              margin: "0 0 4px",
            }}
          >
            Reference
          </Text>
          <Text
            style={{
              fontSize: "14px",
              color: "#111111",
              fontWeight: 600,
              margin: 0,
            }}
          >
            {docRef}
          </Text>
        </Text>
      )}

      {ctaLabel && ctaUrl && (
        <>
          <ZivvyButton href={ctaUrl}>{ctaLabel}</ZivvyButton>
          <FallbackLink href={ctaUrl} />
        </>
      )}

      <SmallText>
        Manage your notification preferences in{" "}
        <Link
          href="https://zivvy.xyz/settings"
          style={{ color: "#2563EB", textDecoration: "none" }}
        >
          Settings
        </Link>
        .
      </SmallText>
    </ZivvyLayout>
  );
}
