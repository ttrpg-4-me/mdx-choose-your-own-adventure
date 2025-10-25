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
  const cyoaRunner = new CYOARunner(
    JSON.parse(fs.readFileSync("test_output.json", "utf8")),
  );
  expect(cyoaRunner.inventory.credits).toBe(50);
  expect(cyoaRunner.isDone).toBe(false);

  expect(cyoaRunner.transitionOptions[0].text).toBe(
    "Buy some soup from the woman with 1 cr",
  );
  expect(cyoaRunner.transitionOptions[1].text).toBe(
    "Buy some really special soup from the woman for 100 cr",
  );
  expect(cyoaRunner.transitionOptions[2].text).toBe("Do that other thing");

  expect(cyoaRunner.transitionOptions[0].isValid).toBe(true);
  // can't afford the super special soup
  expect(cyoaRunner.transitionOptions[1].isValid).toBe(false);
  expect(cyoaRunner.transitionOptions[2].isValid).toBe(true);

  // Let's go buy soup, should cost 1 cr
  // This is also an end state so we should see that we're done
  cyoaRunner.transition("#suprise-soup");
  expect(cyoaRunner.inventory.credits).toBe(49);
  expect(cyoaRunner.isDone).toBe(true);
});

test("parse and run downloaded Google Doc", async () => {
  const fileName = "A Day At The Park.md";
  const ast = await parseMdxToAst(fs.readFileSync(fileName));

  const tree = parseTree(ast);

  const jsonData = JSON.stringify(tree, null, 2);

  expect(jsonData).toBe(fs.readFileSync("park_output.json", "utf8"));

  const cyoaRunner = new CYOARunner(tree);

  expect(cyoaRunner.isDone).toBe(false);

  expect(cyoaRunner.transitionOptions[0].text).toBe(
    "Search through the trash can",
  );
  expect(cyoaRunner.transitionOptions[1].text).toBe("Swing on the swing");
  expect(cyoaRunner.transitionOptions[2].text).toBe("Nap in the grass");
  expect(cyoaRunner.transitionOptions[3].text).toBe("Go home");

  cyoaRunner.transition("#swing");
  cyoaRunner.transition("#arriving-at-the-park");
  cyoaRunner.transition("#go-home");

  expect(cyoaRunner.isDone).toBe(true);
});
