# MDX Choose Your Own Adventure Parser

This is a tool designed to transform MDX documents into choose your own adventure stories.

At this time the repo is just a work in progress, a partial MDX parser has been built.

## Run Tests

```shell
npm install
npm test
```

## Example

In:

```markdown
---
title: Some story
author: John Doe
costToRead: 0
triggers: ["spooky soups", "the great outdoors"]
---

{inventory.credits = 50}
export function If({ when, children }) {
  return when ? <> {children} </> : <> </>;
}


## Start

You arrive in block. A number of hot food vendors line the bedraggled streets and a few catch your eye...

- <If when={inventory.credits > 1}> 
    [Buy some soup from the woman with 1 cr](#suprise-soup)
  </If>
- [Do that other thing](#other-thing)

## Suprise Soup

{inventory.credits = inventory.credits - 1}

Great soup!
Really good

## Other Thing

You do the other thing
```

Out:

```json
{
  "passages": {
    "start": {
      "initializationScript": [],
      "text": [
        "You arrive in block. A number of hot food vendors line the bedraggled streets and a few catch your eye..."
      ],
      "transitions": [
        {
          "transitionCriteria": "inventory.credits > 1",
          "header": "#suprise-soup",
          "text": "Buy some soup from the woman with 1 cr"
        },
        {
          "transitionCriteria": null,
          "header": "#other-thing",
          "text": "Do that other thing"
        }
      ]
    },
    "suprise-soup": {
      "initializationScript": [
        "inventory.credits = inventory.credits - 1"
      ],
      "text": [
        "Great soup!\nReally good"
      ],
      "transitions": []
    },
    "other-thing": {
      "initializationScript": [],
      "text": [
        "You do the other thing"
      ],
      "transitions": []
    }
  },
  "metaData": {
    "title": "Some story",
    "author": "John Doe",
    "costToRead": 0,
    "triggers": [
      "spooky soups",
      "the great outdoors"
    ]
  },
  "initializationScript": [
    "inventory.credits = 50",
    "export function If({ when, children }) {\n  return when ? <> {children} </> : <> </>;\n}"
  ]
}
```
