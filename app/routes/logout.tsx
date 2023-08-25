import type { ActionArgs } from "@remix-run/node";
import { authenticator } from "../services/auth.server.js";

export const action = async ({ request }:ActionArgs) => {
  await authenticator.logout(request, { redirectTo: "/" });
};