import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ActionArgs, json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";

export async function loader() {
  //acceder a base datos, validatios,
  return json([
    { name: "Javier", age: 25 },
    { name: "Mario", age: 22 },
  ]);
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const name = formData.get("name");

  return redirect(`/${name}`);
}

export default function Javier() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <span>Hola</span>
      <h1>Mario</h1>
      <Button>Mario</Button>
      <Input />
      <pre>{JSON.stringify(data)}</pre>
      <Form method="post">
        <input type="text" name="name" id="name" />
      </Form>
      <Link to="/mario" prefetch="intent">
        mario
      </Link>
    </div>
  );
}
