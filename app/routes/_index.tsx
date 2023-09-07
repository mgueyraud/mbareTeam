import { redirect, type ActionArgs } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export const loader = async ({ request }: ActionArgs) => {
  // authenticator.isAuthenticated function returns the user object if found
  // if user is not authenticated then user would be redirected back to homepage ("/" route)
  const user = await authenticator.isAuthenticated(request);

  if (user) {
    return redirect("/dashboard");
  }

  return {
    user,
  };
};

export default function Index() {
  return <div></div>;
}
