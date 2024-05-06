
// import * as compiler from "../compiler"
// import SM from "source-map"
// import {
//     SourceMap,
//     // type CodeInformation,
//     // type CodeMapping,
//     // type VirtualCode,
// } from "@volar/language-core";


// const code = `---
// window
// ---
// `

// const code2 = `---
// window.
// ---
// `
// const r = compiler.convertToTSX(code, {})

// console.log("🚗 ---------------------------------🚗")
// console.log("🚗 ~ file: main.test.ts:19 ~ r:", r)
// console.log("🚗 ---------------------------------🚗")


// const r2 = compiler.convertToTSX(code2, {}, { start: 10 })

// console.log("🚗 ---------------------------------🚗")
// console.log("🚗 ~ file: main.test.ts:19 ~ r:", r2)
// console.log("🚗 ---------------------------------🚗")




// function calculatePositionInFinalDoc(sourceMap: any, originalPosition: any) {
//     let finalPosition = originalPosition;
//     for (const mapping of sourceMap.__originalMappings) {
//         if (!mapping.originalLine || !mapping.originalColumn || !mapping.generatedLine || !mapping.generatedColumn) {
//             continue; // Skip unmapped positions
//         }
//         if (mapping.generatedColumn >= finalPosition) {
//             break; // Stop when the generated column exceeds the final position
//         }
//         if (mapping.originalColumn >= originalPosition) {
//             continue; // Skip mappings that occur after the original position
//         }
//         // Adjust final position based on the difference in original and generated columns
//         finalPosition += mapping.generatedColumn - mapping.originalColumn;
//     }
//     return finalPosition;
// }


// // console.log(positionInFinalDoc);


// // if (r.mapRaw) {
// //     // const rr = new SourceMap(r.mapRaw)
// //     const SMM = r.mapRaw.json("foo.civet", "foo.tsx") as any

// //     // console.log("🚗 -------------------------------------🚗")
// //     // console.log("🚗 ~ file: main.test.ts:36 ~ SMM:", SMM)
// //     // console.log("🚗 -------------------------------------🚗")

// //     // const wow = new SM.SourceMapConsumer(SMM)

// //     // wow.computeColumnSpans()

// //     // console.log("🚗 -------------------------------------🚗")
// //     // console.log("🚗 ~ file: main.test.ts:53 ~ wow:", wow)
// //     // console.log("🚗 -------------------------------------🚗")
// //     // const pois = compiler.offsetToPosition(wow.__generatedMappings, 7)

// //     // console.log("🚗 ---------------------------------------🚗")
// //     // console.log("🚗 ~ file: main.test.ts:60 ~ pois:", pois)
// //     // console.log("🚗 ---------------------------------------🚗")

// //     // const outOff = compiler.positionToOffset(wow.__originalMappings, pois.line, pois.column)

// //     // console.log("🚗 -------------------------------------------🚗")
// //     // console.log("🚗 ~ file: main.test.ts:66 ~ outOff:", outOff)
// //     // console.log("🚗 -------------------------------------------🚗")



// //     // r.mapRaw.updateSourceMap
// //     // // wow.computeColumnSpans()


// //     // const ddd = wow.generatedPositionFor({ "column": 7, "line": 2, "source": "foo." })

// //     // console.log("🚗 -------------------------------------🚗")
// //     // console.log("🚗 ~ file: main.test.ts:58 ~ ddd:", ddd)
// //     // console.log("🚗 -------------------------------------🚗")



// //     // Example usage:
// //     // // const sourceMap = new SourceMapConsumer(someSourcemap);
// //     // const originalPosition = code.indexOf(":= cool ") + 6

// //     // const wowowo = code[originalPosition]

// //     // console.log("🚗 -------------------------------------------🚗")
// //     // console.log("🚗 ~ file: main.test.ts:70 ~ wowowo:", wowowo)
// //     // console.log("🚗 -------------------------------------------🚗")

// //     // // const originalPosition = 
// //     // const positionInFinalDoc = calculatePositionInFinalDoc(wow, originalPosition);

// //     // console.log("🚗 -------------------------------------------------------------------🚗")
// //     // console.log("🚗 ~ file: main.test.ts:70 ~ positionInFinalDoc:", positionInFinalDoc, originalPosition)
// //     // console.log("🚗 -------------------------------------------------------------------🚗")

// //     // const originalChar = code[originalPosition]

// //     // console.log("🚗 -------------------------------------------------------🚗")
// //     // console.log("🚗 ~ file: main.test.ts:76 ~ originalChar:", originalChar)
// //     // console.log("🚗 -------------------------------------------------------🚗")


// //     // const finalChar = r.code[positionInFinalDoc]

// //     // console.log("🚗 -------------------------------------------------🚗")
// //     // console.log("🚗 ~ file: main.test.ts:83 ~ finalChar:", finalChar)
// //     // console.log("🚗 -------------------------------------------------🚗")


// //     // // console.log("🚗 -------------------------------------------------------🚗")
// //     // // console.log("🚗 ~ file: main.test.ts:76 ~ originalChar:", originalChar)
// //     // // console.log("🚗 -------------------------------------------------------🚗")
// //     // console.log("🚗 -------------------------------------🚗")
// //     // console.log("🚗 -------------------------------------🚗")


// //     // console.log("🚗 -------------------------------------🚗")
// //     // console.log("🚗 ~ file: main.test.ts:37 ~ wow:", wow)
// //     // console.log("🚗 -------------------------------------🚗")



// //     // const result = wow.generatedPositionFor({ "column": 19, "line": 9, "source": code })

// //     // console.log("🚗 -------------------------------------------🚗")
// //     // console.log("🚗 ~ file: main.test.ts:57 ~ result:", result)
// //     // console.log("🚗 -------------------------------------------🚗")


// //     // console.log("🚗 -------------------------------------------🚗")
// //     // console.log("🚗 ~ file: main.test.ts:38 ~ result:", result)
// //     // console.log("🚗 -------------------------------------------🚗")


// // }
