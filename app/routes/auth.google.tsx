import type { ActionArgs } from "@remix-run/node";
import { authenticator } from "../services/auth.server.js";
import { SocialsProvider } from "remix-auth-socials";

export const action = async ({ request }: ActionArgs) => {
  return await authenticator.authenticate(SocialsProvider.GOOGLE, request);
};
