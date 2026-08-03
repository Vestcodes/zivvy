import { Text } from "@react-email/components";
import { Heading, Paragraph, SmallText, ZivvyLayout } from "./components";

interface ContactReceiptEmailProps {
  fullName: string;
  email: string;
  message: string;
}

export default function ContactReceiptEmail({
  fullName = "Jane Doe",
  email = "jane@example.com",
  message = "I'd like to learn more about Zivvy.",
}: ContactReceiptEmailProps) {
  return (
    <ZivvyLayout preview={`Contact form: ${fullName}`}>
      <Heading>New contact form submission</Heading>
      <Paragraph>A visitor submitted the contact form on zivvy.xyz.</Paragraph>

      <Text
        style={{
          margin: "0 0 24px",
          padding: "20px",
          backgroundColor: "#F7F7F8",
          borderRadius: "10px",
          border: "1px solid #E5E5E5",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
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
          Name
        </Text>
        <Text
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#111111",
            margin: "0 0 16px",
          }}
        >
          {fullName}
        </Text>

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
          Email
        </Text>
        <Text
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#111111",
            margin: "0 0 16px",
          }}
        >
          {email}
        </Text>

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
          Message
        </Text>
        <Text
          style={{
            fontSize: "14px",
            color: "#333333",
            lineHeight: "22px",
            margin: 0,
            whiteSpace: "pre-wrap" as const,
          }}
        >
          {message}
        </Text>
      </Text>

      <SmallText>Reply directly to this email to respond to {fullName}.</SmallText>
    </ZivvyLayout>
  );
}
