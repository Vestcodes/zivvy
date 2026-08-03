import {
  FallbackLink,
  Heading,
  Paragraph,
  SmallText,
  ZivvyButton,
  ZivvyLayout,
} from "./components";

interface ResetPasswordEmailProps {
  firstName: string;
  resetUrl: string;
}

export default function ResetPasswordEmail({
  firstName = "there",
  resetUrl = "https://zivvy.xyz/update-password?key=xxx",
}: ResetPasswordEmailProps) {
  return (
    <ZivvyLayout preview="Reset your Zivvy password">
      <Heading>Reset your password</Heading>
      <Paragraph>
        Hi {firstName}, we received a request to reset your password. Click the
        button below to choose a new one.
      </Paragraph>
      <ZivvyButton href={resetUrl}>Reset password</ZivvyButton>
      <FallbackLink href={resetUrl} />
      <SmallText>
        This link expires in 24 hours. If you didn't request a password reset,
        no action is needed — your account is still secure.
      </SmallText>
    </ZivvyLayout>
  );
}
