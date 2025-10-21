import { parseMdxToAst, parseTree } from "./parser.js";
import { CYOARunner } from "./runner.js";
import fs from "fs";

test("parse mdx into CYOA format", async () => {
  const fileName = "example.mdx";
  const ast = await parseMdxToAst(fs.readFileSync(fileName));

  const tree = parseTree(ast);

  const jsonData = JSON.stringify(tree, null, 2);

  expect(jsonData).toBe(fs.readFileSync("test_output.json", "utf8"));
});


test("run a CYOA game", async () => {
  // Starting the story with 50 cr
  const cyoaRunner = new CYOARunner(JSON.parse(fs.readFileSync("test_output.json", "utf8")))
  expect(cyoaRunner.inventory.credits).toBe(50)
  expect(cyoaRunner.isDone).toBe(false)

  expect(cyoaRunner.transitionOptions[0].text).toBe("Buy some soup from the woman with 1 cr")

  expect(cyoaRunner.transitionOptions[1].text).toBe("Do that other thing")

  expect(cyoaRunner.transitionOptions[0].isValid).toBe(true)

  expect(cyoaRunner.transitionOptions[1].isValid).toBe(true)

  // Let's go buy soup, should cost 1 cr
  // This is also an end state so we should see that we're done
  cyoaRunner.transition("#suprise-soup")
  expect(cyoaRunner.inventory.credits).toBe(49)
  expect(cyoaRunner.isDone).toBe(true)
});