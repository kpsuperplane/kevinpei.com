import { Parent, Root } from "mdast";
import { MdxJsxTextElement, MdxJsxFlowElement, MdxjsEsm } from "mdast-util-mdx";
import { Plugin } from "unified";
import { visit } from "unist-util-visit";
import imageSize from "image-size";
import { promisify } from "util";
import { join } from "path";

const sizeOf = promisify(imageSize);

type Imports = { [key: string]: string };
function resolveSource(
  imports: Imports,
  node: MdxJsxTextElement | MdxJsxFlowElement
) {
  for (const attribute of node.attributes) {
    if (attribute.type === "mdxJsxAttribute" && attribute.name === "src") {
      if (typeof attribute.value === "string") {
        return attribute.value;
      } else if (
        attribute.value != null &&
        typeof attribute.value === "object" &&
        attribute.value.type === "mdxJsxAttributeValueExpression"
      ) {
        const name = attribute.value.value;
        if (name in imports) {
          return imports[name];
        }
      }
    }
  }
  throw new Error(`Unable to parse node ${JSON.stringify(node)}`);
}
async function processImage(
  cwd: string,
  imports: Imports,
  node: MdxJsxTextElement | MdxJsxFlowElement
) {
  const source = resolveSource(imports, node);
  const res = await sizeOf(join(cwd, source));

  if (!res) throw Error(`Invalid image with src "${source}"`);
  node.attributes.push(
    { type: "mdxJsxAttribute", name: "width", value: res.width?.toString() },
    { type: "mdxJsxAttribute", name: "height", value: res.height?.toString() }
  );
}

type Options = {
  cwd: string;
};
const remarkMdxImages: Plugin<[Options], Root> =
  ({ cwd }) =>
  async (ast) => {
    const imports: Imports = {};
    visit(ast, "mdxjsEsm", (node: MdxjsEsm) => {
      const body = node?.data?.estree?.body[0];
      if (body != null && body.type === "ImportDeclaration") {
        const importSpecifier = body.specifiers.find(
          (specifier) => specifier.type === "ImportDefaultSpecifier"
        );
        if (importSpecifier?.local?.type === "Identifier") {
          const name = importSpecifier.local.name;
          const url = body.source.value;
          if (typeof name === "string" && typeof url === "string") {
            imports[name] = url;
          }
        }
      }
    });
    const promises: Promise<void>[] = [];
    visit(ast, "mdxJsxTextElement", (node: MdxJsxTextElement) => {
      if (node.name === "img") {
        promises.push(processImage(cwd, imports, node));
      }
    });
    visit(ast, "mdxJsxFlowElement", (node: MdxJsxFlowElement) => {
      if (node.name === "img") {
        promises.push(processImage(cwd, imports, node));
      }
    });
    await Promise.all(promises);
  };

export default remarkMdxImages;
