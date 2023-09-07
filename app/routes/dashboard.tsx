import type { ActionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";

// file: app/routes/dashboard.js
export const loader = async ({ request }: ActionArgs) => {
  // authenticator.isAuthenticated function returns the user object if found
  // if user is not authenticated then user would be redirected back to homepage ("/" route)
  const user = await authenticator.isAuthenticated(request);

  return {
    user,
  };
};

const Dashboard = () => {
  const { user } = useLoaderData();
  return <p>{JSON.stringify(user)}</p>;
};

export default Dashboard;
