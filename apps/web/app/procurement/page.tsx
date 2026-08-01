import { redirect } from "next/navigation";

export default function ProcurementRedirect() {
  redirect("/purchases/suppliers");
}
