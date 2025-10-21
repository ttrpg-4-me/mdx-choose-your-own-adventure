import { parseMdxToAst, parseTree } from "./index.js";
import fs from "fs";

test("churn through ast", async () => {
  const fileName = "example.mdx";
  const ast = await parseMdxToAst(fs.readFileSync(fileName));

  const tree = parseTree(ast);

  const jsonData = JSON.stringify(tree, null, 2);

  expect(jsonData).toBe(fs.readFileSync("test_output.json", "utf8"));
});
