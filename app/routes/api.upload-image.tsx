import {
  json,
  type ActionArgs,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { s3UploaderHandler } from "~/utils/s3.server";

export const action = async ({ request }: ActionArgs) => {
  try {
    const formData = await unstable_parseMultipartFormData(
      request,
      s3UploaderHandler
    );

    const fileUrl = formData.get("file");

    console.log({ fileUrl });

    return json({
      url: fileUrl,
    });
  } catch (error) {
    return json(
      {
        error,
      },
      { status: 500 }
    );
  }
};
