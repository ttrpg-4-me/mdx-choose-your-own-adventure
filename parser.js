import { remark } from "remark";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import YAML from "yaml";

const scriptTypes = ["mdxjsEsm", "mdxFlowExpression", "mdxJsxFlowElement"];

function parseHeader(tokens) {
  if (tokens.length == 0 || tokens.at(-1).type != "thematicBreak") {
    return {};
  }
  tokens.pop();
  const header = YAML.parse(tokens.at(-1).children[0].value);
  tokens.pop();
  return header;
}

function parseAllType(tokens, valid_types, list) {
  while (tokens.length > 0 && valid_types.includes(tokens.at(-1).type)) {
    list.push(tokens.pop().value);
  }
}

function parseType(tokens, valid_types, list) {
  if (tokens.length > 0 && valid_types.includes(tokens.at(-1).type)) {
    return list.push(tokens.pop().value);
  }
  return null;
}

function convertStringMarkdownHeaderFormat(s) {
  return "#" + s.toLowerCase().replaceAll(" ", "-");
}

function parseTransition(transition) {
  if (!scriptTypes.includes(transition.children[0].type)) {
    return {
      transitionCriteria: null,
      header: transition.children[0].children[0].url,
      text: transition.children[0].children[0].children[0].value,
    };
  }
  if (
    transition.children[0].type == "mdxJsxFlowElement" &&
    transition.children[0].name.toLowerCase() == "if"
  ) {
    return {
      transitionCriteria: transition.children[0].attributes[0].value.value,
      header: transition.children[0].children[0].children[0].url,
      text: transition.children[0].children[0].children[0].children[0].value,
    };
  }

  throw new TypeError();
}

function parsePassage(tokens, tree) {
  while (tokens.length > 0 && tokens.at(-1).type != "heading") {
    tokens.pop();
  }
  if (tokens.length == 0) {
    return;
  }
  const header_name = convertStringMarkdownHeaderFormat(
    tokens.pop().children[0].value,
  );
  tree.passages[header_name] = {
    initializationScript: [],
    text: [],
    transitions: [],
  };

  while (tokens.length > 0 && tokens.at(-1).type != "heading") {
    if (scriptTypes.includes(tokens.at(-1).type)) {
      tree.passages[header_name].initializationScript.push(tokens.pop().value);
      continue;
    }
    if (tokens.at(-1).type == "paragraph") {
      tree.passages[header_name].text.push(tokens.pop().children[0].value);
      continue;
    }
    if (tokens.at(-1).type == "list") {
      tokens.pop().children.forEach((element) => {
        tree.passages[header_name].transitions.push(parseTransition(element));
      });
      continue;
    }
    throw new TypeError();
  }
}

export function parseTree(ast) {
  const tree = {
    passages: {},
  };
  const tokens = ast.children;
  tokens.reverse();
  tree.metaData = parseHeader(tokens);
  tree.initializationScript = [];
  parseAllType(tokens, scriptTypes, tree.initializationScript);

  // Will there be intro text?
  // Would need to parse that here is so

  while (tokens.length > 0) {
    parsePassage(tokens, tree);
  }

  return tree;
}

export async function parseMdxToAst(mdxInput) {
  const file = await remark().use(remarkParse).use(remarkMdx).parse(mdxInput);

  return file;
}
