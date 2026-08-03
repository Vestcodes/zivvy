import {
  FallbackLink,
  Heading,
  Paragraph,
  SmallText,
  ZivvyButton,
  ZivvyLayout,
} from "./components";

interface LoginLinkEmailProps {
  loginUrl: string;
  expiry: string;
}

export default function LoginLinkEmail({
  loginUrl = "https://zivvy.xyz/api/method/frappe.www.login.login_via_key?key=xxx",
  expiry = "10",
}: LoginLinkEmailProps) {
  return (
    <ZivvyLayout preview="Your login link for Zivvy">
      <Heading>Sign in to Zivvy</Heading>
      <Paragraph>
        Click the button below to sign in. This link expires in {expiry}{" "}
        minutes.
      </Paragraph>
      <ZivvyButton href={loginUrl}>Sign in</ZivvyButton>
      <FallbackLink href={loginUrl} />
      <SmallText>
        If you didn't request this, you can safely ignore this email.
      </SmallText>
    </ZivvyLayout>
  );
}
