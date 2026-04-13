import { redirect } from "next/navigation";

export default function AuthGateway() {
  redirect("/auth/login");
}
