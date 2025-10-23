# MDX Choose Your Own Adventure Parser

This is a tool designed to transform MDX documents into choose your own adventure stories.

At this time the repo is just a work in progress, a partial MDX parser has been built.

## Usage

```console
$ node
Welcome to Node.js v25.0.0.
Type ".help" for more information.
> const { CYOARunner } = await import("./runner.js");
undefined
> const cyoaRunner = new CYOARunner(JSON.parse(fs.readFileSync("test_output.json", "utf8")))
undefined
> cyoaRunner.passageText
[
  'You arrive in block. A number of hot food vendors line the bedraggled streets and a few catch your eye...'
]
> cyoaRunner.inventory
{ credits: 50 }
> cyoaRunner.transitionOptions
[
  {
    transitionCriteria: 'inventory.credits > 1',
    header: '#suprise-soup',
    text: 'Buy some soup from the woman with 1 cr',
    isValid: true
  },
  {
    transitionCriteria: 'inventory.credits > 100',
    header: '#super-suprise-soup',
    text: 'Buy some really special soup from the woman for 100 cr',
    isValid: false
  },
  {
    transitionCriteria: null,
    header: '#other-thing',
    text: 'Do that other thing',
    isValid: true
  }
]
> cyoaRunner.transition('#suprise-soup')
undefined
> cyoaRunner.inventory
{ credits: 49 }
> cyoaRunner.passageText
[ 'Great soup!\nReally good' ]
> cyoaRunner.isDone
true
```

## Run Tests

```shell
npm install
npm test
```

## Example

The following MDX file is consumed:

```markdown
---
title: Some story
author: John Doe
costToRead: 0
triggers: ["spooky soups", "the great outdoors"]
---

{inventory.credits = 50}

## Start

You arrive in block. A number of hot food vendors line the bedraggled streets and a few catch your eye...

- <If when={inventory.credits > 1}> 
    [Buy some soup from the woman with 1 cr](#suprise-soup)
  </If>
- <If when={inventory.credits > 100}> 
    [Buy some really special soup from the woman for 100 cr](#super-suprise-soup)
  </If>
- [Do that other thing](#other-thing)

## Suprise Soup

{inventory.credits = inventory.credits - 1}

Great soup!
Really good

## Super Suprising Soup

{inventory.credits = inventory.credits - 100}

WOW WOW WOW!
BEST EVER SOUP!

## Other Thing

You do the other thing
```

Internally, the file is converted to this representation:

```json
{
  "passages": {
    "#start": {
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
          "transitionCriteria": "inventory.credits > 100",
          "header": "#super-suprise-soup",
          "text": "Buy some really special soup from the woman for 100 cr"
        },
        {
          "transitionCriteria": null,
          "header": "#other-thing",
          "text": "Do that other thing"
        }
      ]
    },
    "#suprise-soup": {
      "initializationScript": [
        "inventory.credits = inventory.credits - 1"
      ],
      "text": [
        "Great soup!\nReally good"
      ],
      "transitions": []
    },
    "#super-suprising-soup": {
      "initializationScript": [
        "inventory.credits = inventory.credits - 100"
      ],
      "text": [
        "WOW WOW WOW!\nBEST EVER SOUP!"
      ],
      "transitions": []
    },
    "#other-thing": {
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
    "inventory.credits = 50"
  ]
}
```

Finally, a runner is provided to actually navigate through the choose your own adventure

## Security

Never use this package to run untrusted MDX files. Treat MDX files like source code, as any code in those files will be executed.
