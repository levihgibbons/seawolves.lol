import { redirect } from "next/navigation";

// Sign-up is now the same unified email-first flow as sign-in — kept as a
// redirect (rather than removed outright) for anyone with this URL bookmarked.
export default function SignupPage() {
  redirect("/login");
}
