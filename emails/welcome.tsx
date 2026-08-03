import {
  FallbackLink,
  Heading,
  Paragraph,
  SmallText,
  ZivvyButton,
  ZivvyLayout,
} from "./components";

interface WelcomeEmailProps {
  firstName: string;
  resetUrl: string;
}

export default function WelcomeEmail({
  firstName = "there",
  resetUrl = "https://zivvy.xyz/update-password?key=xxx",
}: WelcomeEmailProps) {
  return (
    <ZivvyLayout preview="Set your password to activate your Zivvy workspace">
      <Heading>Welcome to Zivvy, {firstName}.</Heading>
      <Paragraph>
        Your workspace is ready. Set a password to get started with accounting,
        inventory, CRM, and everything else your business needs.
      </Paragraph>
      <ZivvyButton href={resetUrl}>Set your password</ZivvyButton>
      <FallbackLink href={resetUrl} />
      <SmallText>
        This link expires in 24 hours. If you didn't create a Zivvy account,
        ignore this email.
      </SmallText>
    </ZivvyLayout>
  );
}
