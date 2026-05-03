import { defaultSchema } from "rehype-sanitize";
import type { Schema } from "hast-util-sanitize";

/**
 * GitHub-style defaults + allow controlled image sizing from the editor.
 */
export const markdownSanitizeSchema: Schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      ["width", /^\d{1,4}$/],
      ["height", /^\d{1,4}$/],
      [
        "style",
        /^width:\s*\d{1,3}%;\s*max-width:\s*100%;\s*height:\s*auto$/,
      ],
    ],
  },
};
