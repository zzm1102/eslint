/**
 * @fileoverview This option sets a specific tab width for your code

 * This rule has been ported and modified from nodeca.
 * @author Vitaly Puzrin
 * @author Gyandeep Singh
 * @copyright 2015 Vitaly Puzrin. All rights reserved.
 * @copyright 2015 Gyandeep Singh. All rights reserved.
 Copyright (C) 2014 by Vitaly Puzrin

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
var util = require("util");
var lodash = require("lodash");

module.exports = {
    meta: {
        docs: {
            description: "enforce consistent indentation",
            category: "Stylistic Issues",
            recommended: false
        },

        fixable: "whitespace",

        schema: [
            {
                "oneOf": [
                    {
                        "enum": ["tab"]
                    },
                    {
                        "type": "integer",
                        "minimum": 0
                    }
                ]
            },
            {
                "type": "object",
                "properties": {
                    "SwitchCase": {
                        "type": "integer",
                        "minimum": 0
                    },
                    "MemberExpression": {
                        "type": "integer",
                        "minimum": 0
                    },
                    "VariableDeclarator": {
                        "oneOf": [
                            {
                                "type": "integer",
                                "minimum": 0
                            },
                            {
                                "type": "object",
                                "properties": {
                                    "var": {
                                        "type": "integer",
                                        "minimum": 0
                                    },
                                    "let": {
                                        "type": "integer",
                                        "minimum": 0
                                    },
                                    "const": {
                                        "type": "integer",
                                        "minimum": 0
                                    }
                                }
                            }
                        ]
                    }
                },
                "additionalProperties": false
            }
        ]
    },

    create: function (context) {

        var MESSAGE = "Expected indentation of {{needed}} {{type}} {{characters}} but found {{gotten}}.";
        var DEFAULT_VARIABLE_INDENT = 1;

        var indentType = "space";
        var indentSize = 4;
        var options = {
            SwitchCase: 0,
            MemberExpression: 1,
            VariableDeclarator: {
                var: DEFAULT_VARIABLE_INDENT,
                let: DEFAULT_VARIABLE_INDENT,
                const: DEFAULT_VARIABLE_INDENT
            }
        };

        var sourceCode = context.getSourceCode();

        if (context.options.length) {
            if (context.options[0] === "tab") {
                indentSize = 1;
                indentType = "tab";
            } else /* istanbul ignore else : this will be caught by options validation */ if (typeof context.options[0] === "number") {
                indentSize = context.options[0];
                indentType = "space";
            }

            if (context.options[1]) {
                var opts = context.options[1];
                options.SwitchCase = opts.SwitchCase || 0;
                options.MemberExpression = typeof opts.MemberExpression === "number" ? opts.MemberExpression : 1;
                var variableDeclaratorRules = opts.VariableDeclarator;
                if (typeof variableDeclaratorRules === "number") {
                    options.VariableDeclarator = {
                        var: variableDeclaratorRules,
                        let: variableDeclaratorRules,
                        const: variableDeclaratorRules
                    };
                } else if (typeof variableDeclaratorRules === "object") {
                    lodash.assign(options.VariableDeclarator, variableDeclaratorRules);
                }
            }
        }

        var indentPattern = {
            normal: indentType === "space" ? /^ +/ : /^\t+/,
            excludeCommas: indentType === "space" ? /^[ ,]+/ : /^[\t,]+/
        };

        var indentMap = {};

        function addIndentChange(node, line, level, collapsible) {
            if (level === 0) {
                return;
            }

            var list = indentMap[line] || [];
            list.push({node: node.type, value: level * indentSize, collapsible: collapsible});
            indentMap[line] = list;
        }

        /**
         * Reports a given indent violation and properly pluralizes the message
         * @param {ASTNode} node Node violating the indent rule
         * @param {int} needed Expected indentation character count
         * @param {int} gotten Indentation character count in the actual node/code
         * @param {Object=} loc Error line and column location
         * @param {boolean} isLastNodeCheck Is the error for last node check
         * @returns {void}
         */
        function report(node, needed, gotten, loc, isLastNodeCheck) {
            var msgContext = {
                needed: needed,
                type: indentType,
                characters: needed === 1 ? "character" : "characters",
                gotten: gotten
            };
            var indentChar = indentType === "space" ? " " : "\t";

            /**
             * Responsible for fixing the indentation issue fix
             * @returns {Function} function to be executed by the fixer
             * @private
             */
            function getFixerFunction() {
                var rangeToFix = [];

                if (needed > gotten) {
                    var spaces = "" + new Array(needed - gotten + 1).join(indentChar);  // replace with repeat in future

                    if (isLastNodeCheck === true) {
                        rangeToFix = [
                            node.range[1] - 1,
                            node.range[1] - 1
                        ];
                    } else {
                        rangeToFix = [
                            node.range[0],
                            node.range[0]
                        ];
                    }

                    return function (fixer) {
                        return fixer.insertTextBeforeRange(rangeToFix, spaces);
                    };
                } else {
                    if (isLastNodeCheck === true) {
                        rangeToFix = [
                            node.range[1] - (gotten - needed) - 1,
                            node.range[1] - 1
                        ];
                    } else {
                        rangeToFix = [
                            node.range[0] - (gotten - needed),
                            node.range[0]
                        ];
                    }

                    return function (fixer) {
                        return fixer.removeRange(rangeToFix);
                    };
                }
            }

            if (loc) {
                context.report({
                    node: node,
                    loc: loc,
                    message: MESSAGE,
                    data: msgContext,
                    fix: getFixerFunction()
                });
            } else {
                context.report({
                    node: node,
                    message: MESSAGE,
                    data: msgContext,
                    fix: getFixerFunction()
                });
            }
        }

        /**
         * Check if the node or node body is a BlockStatement or not
         * @param {ASTNode} node node to test
         * @returns {boolean} True if it or its body is a block statement
         */
        function isNodeBodyBlock(node) {
            return node.type === "BlockStatement" ||
                node.body && node.body.type === "BlockStatement" ||
                node.consequent && node.consequent.type === "BlockStatement";
        }

        function indentBlock(node, size) {
            var startLine = node.loc.start.line;
            var endLine = node.loc.end.line;

            if (endLine - startLine <= 1) {
                return;
            }

            if (typeof size === "undefined") {
                size = 1;
            }

            addIndentChange(node, startLine + 1, size, true);
            addIndentChange(node, endLine, -size, true);
        }

        function indentAsImplicitBlock(node, size) {
            var startLine = node.loc.start.line;
            var endLine = node.loc.end.line;

            if (endLine === startLine) {
                return;
            }

            if (typeof size === "undefined") {
                size = 1;
            }

            addIndentChange(node, startLine + 1, size, true);
            addIndentChange(node, endLine + 1, -size);
        }

        function indentWholeNode(node, size) {
            var startLine = node.loc.start.line;
            var endLine = node.loc.end.line;

            if (typeof size === "undefined") {
                size = 1;
            }

            addIndentChange(node, startLine, size);
            addIndentChange(node, endLine + 1, -size);
        }

        /**
         * Check and decide whether to check for indentation for blockless nodes
         * Scenarios are for or while statements without braces around them
         * @param {ASTNode} node node to examine
         * @returns {void}
         */
        function blockLessNodes(node) {
            if (isNodeBodyBlock(node)) {
                return;
            }

            indentBlock(node);
        }

        // TODO: We need to define which nodes are collapsible with each other
        function groupCollapsible(indents, change, idx, changes) {
            var lastChange = indents[indents.length - 1];
            var currentChange = change.value;

            if (change.collapsible &&
                changes[idx - 1] &&
                changes[idx - 1].collapsible &&
                (lastChange > 0) === (currentChange > 0)
            ) {
                if (Math.abs(lastChange) <= Math.abs(currentChange)) {
                    indents[indents.length - 1] = currentChange;
                }
            } else {
                indents.push(change.value);
            }

            return indents;
        }

        return {
            "ClassBody": indentBlock,

            "BlockStatement": indentBlock,

            "WhileStatement": blockLessNodes,

            "ForStatement": blockLessNodes,

            "ForInStatement": blockLessNodes,

            "ForOfStatement": blockLessNodes,

            "DoWhileStatement": blockLessNodes,

            "IfStatement": function (node) {
                if (node.consequent.type !== "BlockStatement" && node.consequent.loc.start.line > node.loc.start.line) {
                    indentWholeNode(node.consequent);
                }
                if (node.alternate && node.alternate.type !== "BlockStatement" && node.alternate.loc.start.line > node.consequent.loc.end.line + 1) {
                    indentWholeNode(node.alternate);
                }
            },

            "CallExpression": function (node) {
                var callStart = sourceCode.getTokenAfter(node.callee);
                while (callStart.value !== "(") {
                    callStart = sourceCode.getTokenAfter(callStart);
                }

                var startLine = callStart.loc.start.line;
                var endLine = node.loc.end.line;

                if (startLine === endLine) {
                    return;
                }

                addIndentChange(node, startLine + 1, 1, true);
                addIndentChange(node, endLine, -1, true);
            },

            "VariableDeclaration": function (node) {
                var startLine = node.loc.start.line;
                var endLine = node.loc.end.line;

                if (endLine === startLine) {
                    return;
                }

                var size = options.VariableDeclarator[node.kind];

                addIndentChange(node, startLine + 1, size, true);
                addIndentChange(node, endLine + 1, -size, true);
            },

            "ObjectExpression": indentBlock,
            "ArrayExpression": indentBlock,

            "SwitchStatement": function (node) {
                indentBlock(node, options.SwitchCase);
            },

            "SwitchCase": indentAsImplicitBlock,
            "MemberExpression": function (node) {
                indentAsImplicitBlock(node, options.MemberExpression);
            },

            "Program:exit": function (node) {
                var lines = sourceCode.getLines();
                var indents = new Array(lines.length);
                indents[0] = 0;
                for (var i = 1; i < lines.length; i++) {
                    console.log(i + 1, indentMap[i + 1]);
                    indents[i] = indents[i - 1] + (indentMap[i + 1] ? indentMap[i + 1].reduce(
                            groupCollapsible, []
                        ).reduce(function (sum, itm) {
                            return sum + itm;
                        }) : 0);

                    if (indents[i] < 0) {
                        indents[i] = 0;
                    }
                    console.log(i + 1, indents[i])
                }

                lines.forEach(function (line, idx) {
                    if (!line.trim()) {
                        return;
                    }

                    var match = indentPattern.excludeCommas.exec(line);
                    var indent = match ? match[0].length : 0;
                    var expected = indents[idx];

                    if (expected !== indent) {
                        report(node, expected, indent, {line: idx + 1, column: indent - 1});
                    }

                });
            }
        }
    }
};
