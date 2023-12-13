import { json, type ActionArgs } from "@remix-run/node";
import { deleteObject } from "~/utils/s3.server";
import path from "path";

export const action = async ({ request }: ActionArgs) => {
  try {
    const data = await request.json();
    const imageUrl = data.image as string;
    const urlWithoutParams = imageUrl.split("?")[0];
    const keyId = path.basename(urlWithoutParams);

    await deleteObject(keyId);

    return json(null, { status: 200 });
  } catch (e) {
    return json(null, { status: 500 });
  }
};
