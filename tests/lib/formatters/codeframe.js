/**
 * @fileoverview Tests for codeframe reporter.
 * @author Vitor Balocco
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("chai").assert;
const chalk = require("chalk");
const path = require("path");

const formatter = require("../../../lib/formatters/codeframe");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("formatter:codeframe", function() {
    describe("when passed no messages", function() {
        const code = [{
            filePath: "foo.js",
            messages: []
        }];

        it("should return nothing", function() {
            const result = formatter(code);

            assert.equal(result, "");
        });
    });

    describe("when passed a single message", function() {
        const code = [{
            filePath: path.join(process.cwd(), "lib", "foo.js"),
            source: "var foo = 1;\n var bar = 2;\n",
            messages: [{
                message: "Unexpected foo.",
                severity: 2,
                line: 1,
                column: 5,
                ruleId: "foo"
            }]
        }];

        it("should return a string in the correct format for errors", function() {
            const result = formatter(code);

            assert.equal(chalk.stripColor(result), [
                `error: Unexpected foo (foo) at ${path.join("lib", "foo.js")}:1:5:`,
                "> 1 | var foo = 1;",
                "    |     ^",
                "  2 |  var bar = 2;",
                "  3 | ",
                "\n",
                "1 code style error found."
            ].join("\n"));
            assert.include(result, `${chalk.styles.red.open}${chalk.styles.bold.open}`);
            assert.notInclude(result, `${chalk.styles.yellow.open}`);
        });

        it("should return a string in the correct format for warnings", function() {
            code[0].messages[0].severity = 1;

            const result = formatter(code);

            assert.equal(chalk.stripColor(result), [
                `warning: Unexpected foo (foo) at ${path.join("lib", "foo.js")}:1:5:`,
                "> 1 | var foo = 1;",
                "    |     ^",
                "  2 |  var bar = 2;",
                "  3 | ",
                "\n",
                "1 code style warning found."
            ].join("\n"));
            assert.include(result, `${chalk.styles.yellow.open}${chalk.styles.bold.open}`);
            assert.notInclude(result, `${chalk.styles.red.open}`);
        });

        it("should return correct coloring for error message", function() {
            code[0].messages[0].severity = 2;

            const result = formatter(code);

            assert.equal(result.split("\n")[0], [
                `${chalk.styles.red.open}error${chalk.styles.red.close}:`,
                `${chalk.styles.bold.open}Unexpected foo${chalk.styles.bold.close}`,
                `${chalk.styles.dim.open}(foo)${chalk.styles.dim.close} at`,
                `${chalk.styles.green.open}${path.join("lib", "foo.js")}:1:5${chalk.styles.green.close}:`
            ].join(" "));
        });

        it("should return correct coloring for warning message", function() {
            code[0].messages[0].severity = 1;

            const result = formatter(code);

            assert.equal(result.split("\n")[0], [
                `${chalk.styles.yellow.open}warning${chalk.styles.yellow.close}:`,
                `${chalk.styles.bold.open}Unexpected foo${chalk.styles.bold.close}`,
                `${chalk.styles.dim.open}(foo)${chalk.styles.dim.close} at`,
                `${chalk.styles.green.open}${path.join("lib", "foo.js")}:1:5${chalk.styles.green.close}:`
            ].join(" "));
        });

        it("should return red summary when there are errors", function() {
            const red = chalk.styles.red;
            const bold = chalk.styles.bold;

            code[0].messages[0].severity = 2;

            const result = formatter(code).split("\n");

            assert.equal(
                result[result.length - 1],
                `${red.open}${bold.open}1 code style error found.${bold.close}${red.close}`
            );
        });

        it("should return yellow summary when there are only warnings", function() {
            const yellow = chalk.styles.yellow;
            const bold = chalk.styles.bold;

            code[0].messages[0].severity = 1;

            const result = formatter(code).split("\n");

            assert.equal(
                result[result.length - 1],
                `${yellow.open}${bold.open}1 code style warning found.${bold.close}${yellow.close}`
            );
        });
    });

    describe("when passed multiple messages", function() {
        const code = [{
            filePath: "foo.js",
            source: "const foo = 1\n",
            messages: [{
                message: "Missing semicolon.",
                severity: 2,
                line: 1,
                column: 14,
                ruleId: "semi"
            }, {
                message: "'foo' is assigned a value but never used.",
                severity: 2,
                line: 1,
                column: 7,
                ruleId: "no-unused-vars"
            }],
        }];

        it("should return a string with multiple entries", function() {
            const result = formatter(code);

            assert.equal(chalk.stripColor(result), [
                "error: Missing semicolon (semi) at foo.js:1:14:",
                "> 1 | const foo = 1",
                "    |              ^",
                "  2 | ",
                "\n",
                "error: 'foo' is assigned a value but never used (no-unused-vars) at foo.js:1:7:",
                "> 1 | const foo = 1",
                "    |       ^",
                "  2 | ",
                "\n",
                "2 code style errors found."
            ].join("\n"));
        });
    });

    describe("when passed one file with 1 message and fixes applied", function() {
        const code = [{
            filePath: "foo.js",
            messages: [{
                ruleId: "no-unused-vars",
                severity: 2,
                message: "'foo' is assigned a value but never used.",
                line: 4,
                column: 11,
                source: "    const foo = 1;"
            }],
            output: "function foo() {\n\n    // a comment\n    const foo = 1;\n}\n\n"
        }];

        it("should return a string with code preview pointing to the correct location after fixes", function() {
            const result = formatter(code);

            assert.equal(chalk.stripColor(result), [
                "error: 'foo' is assigned a value but never used (no-unused-vars) at foo.js:4:11:",
                "  2 | ",
                "  3 |     // a comment",
                "> 4 |     const foo = 1;",
                "    |           ^",
                "  5 | }",
                "  6 | ",
                "  7 | ",
                "\n",
                "1 code style error found."
            ].join("\n"));
        });
    });

    describe("when passed multiple files with 1 message each", function() {
        const code = [{
            filePath: "foo.js",
            source: "const foo = 1\n",
            messages: [{
                message: "Missing semicolon.",
                severity: 2,
                line: 1,
                column: 14,
                ruleId: "semi"
            }]
        }, {
            filePath: "bar.js",
            source: "const bar = 2\n",
            messages: [{
                message: "Missing semicolon.",
                severity: 2,
                line: 1,
                column: 14,
                ruleId: "semi"
            }]
        }];

        it("should return a string with multiple entries", function() {
            const result = formatter(code);

            assert.equal(chalk.stripColor(result), [
                "error: Missing semicolon (semi) at foo.js:1:14:",
                "> 1 | const foo = 1",
                "    |              ^",
                "  2 | ",
                "\n",
                "error: Missing semicolon (semi) at bar.js:1:14:",
                "> 1 | const bar = 2",
                "    |              ^",
                "  2 | ",
                "\n",
                "2 code style errors found."
            ].join("\n"));
        });
    });

    describe("when passed a fatal error message", function() {
        const code = [{
            filePath: "foo.js",
            source: "e{}\n",
            messages: [{
                ruleId: null,
                fatal: true,
                severity: 2,
                source: "e{}",
                message: "Parsing error: Unexpected token {",
                line: 1,
                column: 2
            }]
        }];

        it("should return a string in the correct format", function() {
            const result = formatter(code);

            assert.equal(chalk.stripColor(result), [
                "error: Parsing error: Unexpected token { at foo.js:1:2:",
                "> 1 | e{}",
                "    |  ^",
                "  2 | ",
                "\n",
                "1 code style error found."
            ].join("\n"));
        });
    });

    describe("when passed one file not found message", function() {
        const code = [{
            filePath: "foo.js",
            messages: [{
                fatal: true,
                message: "Couldn't find foo.js."
            }]
        }];

        it("should return a string without code preview (codeframe)", function() {
            const result = formatter(code);

            assert.equal(chalk.stripColor(result), "error: Couldn't find foo.js at foo.js\n\n\n1 code style error found.");
        });
    });

    describe("when passed a single message with no line or column", function() {
        const code = [{
            filePath: "foo.js",
            messages: [{
                ruleId: "foo",
                message: "Unexpected foo.",
                severity: 2,
                source: "foo"
            }]
        }];

        it("should return a string without code preview (codeframe)", function() {
            const result = formatter(code);

            assert.equal(chalk.stripColor(result), "error: Unexpected foo (foo) at foo.js\n\n\n1 code style error found.");
        });

        it("should output filepath but without 'line:column' appended", function() {
            const result = formatter(code);

            assert.equal(chalk.stripColor(result), "error: Unexpected foo (foo) at foo.js\n\n\n1 code style error found.");
        });
    });
});
