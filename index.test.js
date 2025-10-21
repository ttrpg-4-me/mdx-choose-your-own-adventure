import {parseMdxToAst, parseTree} from "./index.js"
import fs from "fs"


test("churn through ast", async () => {
    const fileName = 'example.mdx'
    const ast = await parseMdxToAst(fs.readFileSync(fileName))

    // expect(console.log(JSON.stringify(ast, null, 2))).toBe("");

    parseTree(ast)

    // const parsed = await parseMdxToAst(fs.readFileSync(fileName)).then(ast => {
    //     expect(console.log(JSON.stringify(ast, null, 2)))
    //     .toBe("")
        
})




