import { type ActionArgs, json, type LoaderArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { createUser, getUsers } from "~/services/users.server";

export async function loader({ request }: LoaderArgs) {
  const users = await getUsers();
  return json(users);
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const actionButton = "" + formData.get("actionButton");
  const name = "" + formData.get("name");
  const username = "" + formData.get("username");
  const user = await createUser({ name, username });
  return json({ user });
}

export default function NuevaRuta() {
  const users = useLoaderData();
  return (
    <div>
      {JSON.stringify(users)}
      <Form method="POST">
        <input type="text" name="name" />
        <input type="text" name="username" />
        <button name="actionButton" value="ejecutame_otro">
          Create User
        </button>
      </Form>
      <Form method="POST" action="/otra/ruta">
        <button name="actionButton" value="ejecutame_esto">
          Another form
        </button>
      </Form>
    </div>
  );
}
