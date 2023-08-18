// file: app/routes/dashboard.js


import { useLoaderData } from "@remix-run/react";
import { authenticator } from "../services/auth.server.js";
import type { ActionArgs } from "@remix-run/node";

const CONTAINER_STYLES = {
  width: "100%",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
};

const BUTTON_STYLES = {
  padding: "15px 25px",
  background: "#dd4b39",
  border: "0",
  outline: "none",
  cursor: "pointer",
  color: "white",
  fontWeight: "bold",
};

export const loader = async ({ request }:ActionArgs) => {
  // authenticator.isAuthenticated function returns the user object if found
  // if user is not authenticated then user would be redirected back to homepage ("/" route)
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  return {
    user,
  };
};

const Dashboard = () => {
  // getting user from loader data
  const { user } = useLoaderData();
  console.log(user._json.given_name);
  // displaying authenticated user data
  return (
    <div style={CONTAINER_STYLES}>
      <h1>You are LoggedIn</h1>
      <p>{user.displayName}</p>
    </div>
  );
};

export default Dashboard;