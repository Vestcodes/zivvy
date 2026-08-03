import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

const BRAND_COLOR = "#111111";
const ACCENT = "#2563EB";
const TEXT_SECONDARY = "#555555";
const TEXT_MUTED = "#888888";
const BORDER = "#E5E5E5";
const BG = "#F7F7F8";

const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

export function ZivvyLogo() {
  return (
    <Section style={{ textAlign: "center" as const, marginBottom: "32px" }}>
      <Text
        style={{
          fontSize: "24px",
          fontWeight: 800,
          letterSpacing: "-0.5px",
          color: BRAND_COLOR,
          fontFamily,
          margin: 0,
        }}
      >
        Zivvy
      </Text>
    </Section>
  );
}

export function ZivvyButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Section style={{ textAlign: "center" as const, margin: "32px 0" }}>
      <Link
        href={href}
        style={{
          display: "inline-block",
          padding: "14px 32px",
          backgroundColor: BRAND_COLOR,
          color: "#FFFFFF",
          textDecoration: "none",
          borderRadius: "10px",
          fontWeight: 600,
          fontSize: "15px",
          fontFamily,
        }}
      >
        {children}
      </Link>
    </Section>
  );
}

export function ZivvyFooter() {
  return (
    <>
      <Hr style={{ borderColor: BORDER, margin: "32px 0 24px" }} />
      <Text
        style={{
          fontSize: "13px",
          color: TEXT_MUTED,
          lineHeight: "20px",
          fontFamily,
          margin: 0,
          textAlign: "center" as const,
        }}
      >
        <Link
          href="https://zivvy.xyz"
          style={{ color: TEXT_SECONDARY, textDecoration: "none" }}
        >
          zivvy.xyz
        </Link>
        {"  ·  "}
        <Link
          href="https://zivvy.xyz/terms"
          style={{ color: TEXT_MUTED, textDecoration: "none" }}
        >
          Terms
        </Link>
        {"  ·  "}
        <Link
          href="https://zivvy.xyz/privacy"
          style={{ color: TEXT_MUTED, textDecoration: "none" }}
        >
          Privacy
        </Link>
      </Text>
      <Text
        style={{
          fontSize: "12px",
          color: TEXT_MUTED,
          fontFamily,
          margin: "8px 0 0",
          textAlign: "center" as const,
        }}
      >
        You received this because you have a Zivvy account.
      </Text>
    </>
  );
}

export function ZivvyLayout({
  preview,
  children,
}: {
  preview: string;
  children: ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: BG,
          fontFamily,
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            maxWidth: "520px",
            margin: "0 auto",
            padding: "48px 20px 40px",
          }}
        >
          <ZivvyLogo />
          <Section
            style={{
              backgroundColor: "#FFFFFF",
              border: `1px solid ${BORDER}`,
              borderRadius: "12px",
              padding: "36px 32px",
            }}
          >
            {children}
          </Section>
          <Section style={{ padding: "0 8px" }}>
            <ZivvyFooter />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function Heading({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        fontSize: "22px",
        fontWeight: 700,
        color: BRAND_COLOR,
        lineHeight: "28px",
        letterSpacing: "-0.3px",
        fontFamily,
        margin: "0 0 8px",
      }}
    >
      {children}
    </Text>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        fontSize: "15px",
        color: TEXT_SECONDARY,
        lineHeight: "24px",
        fontFamily,
        margin: "0 0 16px",
      }}
    >
      {children}
    </Text>
  );
}

export function SmallText({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        fontSize: "13px",
        color: TEXT_MUTED,
        lineHeight: "20px",
        fontFamily,
        margin: "0",
      }}
    >
      {children}
    </Text>
  );
}

export function FallbackLink({ href }: { href: string }) {
  return (
    <Text
      style={{
        fontSize: "13px",
        color: TEXT_MUTED,
        lineHeight: "20px",
        fontFamily,
        margin: "8px 0 0",
      }}
    >
      Or copy this link into your browser:{" "}
      <Link
        href={href}
        style={{
          color: ACCENT,
          textDecoration: "none",
          wordBreak: "break-all" as const,
        }}
      >
        {href}
      </Link>
    </Text>
  );
}
