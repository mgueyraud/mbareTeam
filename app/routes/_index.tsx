import type { V2_MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { SocialsProvider } from "remix-auth-socials";
import { Button } from "@/components/ui/button";

const CONTAINER_STYLES = {
  width: "100%",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <Form
        method="post"
        action={`/auth/${SocialsProvider.GOOGLE}`}
        style={CONTAINER_STYLES}
      >
        <Button>Iniciar Sesion</Button>
      </Form>
    </div>
  );
}
