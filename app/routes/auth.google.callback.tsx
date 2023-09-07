import type { ActionArgs } from "@remix-run/node";
import { authenticator } from "../services/auth.server";
import { SocialsProvider } from "remix-auth-socials";

export const loader = ({ request }: ActionArgs) => {
  return authenticator.authenticate(SocialsProvider.GOOGLE, request, {
    successRedirect: "/dashboard",
  });
};
