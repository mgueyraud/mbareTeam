import type { ActionArgs } from "@remix-run/node";
import { authenticator } from "../services/auth.server.js";
import { SocialsProvider } from "remix-auth-socials";

export const action = async ({ request }:ActionArgs) => {
  // initiating authentication using Google Strategy
  // on success --> redirect to dasboard
  // on failure --> back to homepage/login
  return await authenticator.authenticate(SocialsProvider.GOOGLE, request, {
    successRedirect: "/dashboard",
    failureRedirect: "/",
  });
};