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
  let header = s.toLowerCase().replaceAll(" ", "-");
  const specialCharacters = [
    "?",
    "*",
    "\\",
    "[",
    "]",
    "*",
    "(",
    ")",
    "/",
    "!",
    ",",
    "’",
    "'",
    "!",
  ];
  for (const char of specialCharacters) {
    header = header.replace(char, "");
  }

  return "#" + header;
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

  throw new TypeError(
    `No implementation available for parsing MDX element of ${transition.children[0].type} type`,
  );
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
    console.log(
      `No implementation available for parsing MDX element of ${tokens.at(-1).type} type\n${tokens.pop()}`,
    );
  }
}

function isPassageHeader(token) {
  return token.type == "heading" && token.depth > 1;
}

function parseIntro(tokens, tree) {
  while (tokens.length > 0 && !isPassageHeader(tokens.at(-1))) {
    if (scriptTypes.includes(tokens.at(-1).type)) {
      tree.initializationScript.push(tokens.pop().value);
      continue;
    }
    if (tokens.at(-1).type == "paragraph") {
      tree.introText.push(tokens.pop().children[0].value);
      if (tree.introText.at(-1).toLowerCase().startsWith("by ")) {
        tree.metaData.author = /^by\s+(.*)$/i.exec(tree.introText.at(-1))[1];
      }
      continue;
    }
    if (tokens.at(-1).type == "heading") {
      const title = tokens.pop().children[0].value;
      if (!("title" in tree.metaData)) {
        tree.metaData.title = title;
      }
      continue;
    }
    console.log(
      `No implementation available for parsing MDX element of ${tokens.at(-1).type} type\n${tokens.pop()}`,
    );
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
  tree.introText = [];
  parseIntro(tokens, tree);

  // Will there be intro text?
  // Would need to parse that here is so

  while (tokens.length > 0) {
    parsePassage(tokens, tree);
  }

  return tree;
}

function stripCustomHeaderIds(mdxInput) {
  const re = / \{#.*?}/g;

  return mdxInput.toString().replace(re, "");
}

function stripBackslashes(mdxInput) {
  const re = /\\/g;

  return mdxInput.toString().replace(re, "");
}

function stripGoogleDocsArtifactsFromMarkdown(mdxInput) {
  return stripBackslashes(stripCustomHeaderIds(mdxInput));
}

export async function parseMdxToAst(mdxInput) {
  const file = await remark()
    .use(remarkParse)
    .use(remarkMdx)
    .parse(stripGoogleDocsArtifactsFromMarkdown(mdxInput));

  return file;
}
