import { redirect } from "next/navigation";

/** Deep link used in emails / marketing — land on the login forgot flow. */
export default function ForgotPasswordRedirect() {
  redirect("/login#forgot");
}
