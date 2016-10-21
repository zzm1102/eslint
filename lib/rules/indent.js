/**
 * @fileoverview This option sets a specific tab width for your code
 *
 * This rule has been ported and modified from nodeca.
 * @author Vitaly Puzrin
 * @author Gyandeep Singh
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

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
                oneOf: [
                    {
                        enum: ["tab"]
                    },
                    {
                        type: "integer",
                        minimum: 0
                    }
                ]
            },
            {
                type: "object",
                properties: {
                    SwitchCase: {
                        type: "integer",
                        minimum: 0
                    },
                    VariableDeclarator: {
                        oneOf: [
                            {
                                type: "integer",
                                minimum: 0
                            },
                            {
                                type: "object",
                                properties: {
                                    var: {
                                        type: "integer",
                                        minimum: 0
                                    },
                                    let: {
                                        type: "integer",
                                        minimum: 0
                                    },
                                    const: {
                                        type: "integer",
                                        minimum: 0
                                    }
                                }
                            }
                        ]
                    },
                    outerIIFEBody: {
                        type: "integer",
                        minimum: 0
                    },
                    MemberExpression: {
                        type: "integer",
                        minimum: 0
                    },
                    FunctionDeclaration: {
                        type: "object",
                        properties: {
                            parameters: {
                                oneOf: [
                                    {
                                        type: "integer",
                                        minimum: 0
                                    },
                                    {
                                        enum: ["first"]
                                    }
                                ]
                            },
                            body: {
                                type: "integer",
                                minimum: 0
                            }
                        }
                    },
                    FunctionExpression: {
                        type: "object",
                        properties: {
                            parameters: {
                                oneOf: [
                                    {
                                        type: "integer",
                                        minimum: 0
                                    },
                                    {
                                        enum: ["first"]
                                    }
                                ]
                            },
                            body: {
                                type: "integer",
                                minimum: 0
                            }
                        }
                    }
                },
                additionalProperties: false
            }
        ]
    },

    create(context) {
        const DEFAULT_VARIABLE_INDENT = 1;
        const DEFAULT_PARAMETER_INDENT = null; // For backwards compatibility, don't check parameter indentation unless specified in the config
        const DEFAULT_FUNCTION_BODY_INDENT = 1;

        let indentType = "space";
        let indentSize = 4;
        const options = {
            SwitchCase: 0,
            VariableDeclarator: {
                var: DEFAULT_VARIABLE_INDENT,
                let: DEFAULT_VARIABLE_INDENT,
                const: DEFAULT_VARIABLE_INDENT
            },
            outerIIFEBody: 1,
            FunctionDeclaration: {
                parameters: DEFAULT_PARAMETER_INDENT,
                body: DEFAULT_FUNCTION_BODY_INDENT
            },
            FunctionExpression: {
                parameters: DEFAULT_PARAMETER_INDENT,
                body: DEFAULT_FUNCTION_BODY_INDENT
            },
            MemberExpression: null
        };

        const sourceCode = context.getSourceCode();
        const ignoredTokens = new Set();
        const desiredOffsets = sourceCode.tokensAndComments.reduce((map, token) => map.set(token, {offset: 0, from: null}), new Map());
        const variableDeclaratorOffsets = sourceCode.tokensAndComments.reduce((map, token) => map.set(token, 0), new Map());
        const firstTokensByLineNumber = sourceCode.tokensAndComments.reduce((map, token) => {
            if (!map.has(token.loc.start.line)) {
                map.set(token.loc.start.line, token);
                map.set(token.loc.end.line, token);
            }
            return map;
        }, new Map());

        if (context.options.length) {
            if (context.options[0] === "tab") {
                indentSize = 1;
                indentType = "tab";
            } else /* istanbul ignore else : this will be caught by options validation */ if (typeof context.options[0] === "number") {
                indentSize = context.options[0];
                indentType = "space";
            }

            if (context.options[1]) {
                const opts = context.options[1];

                options.SwitchCase = opts.SwitchCase || 0;
                const variableDeclaratorRules = opts.VariableDeclarator;

                if (typeof variableDeclaratorRules === "number") {
                    options.VariableDeclarator = {
                        var: variableDeclaratorRules,
                        let: variableDeclaratorRules,
                        const: variableDeclaratorRules
                    };
                } else if (typeof variableDeclaratorRules === "object") {
                    Object.assign(options.VariableDeclarator, variableDeclaratorRules);
                }

                if (typeof opts.outerIIFEBody === "number") {
                    options.outerIIFEBody = opts.outerIIFEBody;
                }

                if (typeof opts.MemberExpression === "number") {
                    options.MemberExpression = opts.MemberExpression;
                }

                if (typeof opts.FunctionDeclaration === "object") {
                    Object.assign(options.FunctionDeclaration, opts.FunctionDeclaration);
                }

                if (typeof opts.FunctionExpression === "object") {
                    Object.assign(options.FunctionExpression, opts.FunctionExpression);
                }
            }
        }

        /**
         * Creates an error message for a line, given the expected/actual indentation.
         * @param {int} expectedAmount The expected amount of indentation characters for this line
         * @param {int} actualSpaces The actual number of indentation spaces that were found on this line
         * @param {int} actualTabs The actual number of indentation tabs that were found on this line
         * @returns {string} An error message for this line
         */
        function createErrorMessage(expectedAmount, actualSpaces, actualTabs) {
            const expectedStatement = `${expectedAmount} ${indentType}${expectedAmount === 1 ? "" : "s"}`; // e.g. "2 tabs"
            const foundSpacesWord = `space${actualSpaces === 1 ? "" : "s"}`; // e.g. "space"
            const foundTabsWord = `tab${actualTabs === 1 ? "" : "s"}`; // e.g. "tabs"
            let foundStatement;

            if (actualSpaces > 0) {

                // Abbreviate the message if the expected indentation is also spaces.
                // e.g. 'Expected 4 spaces but found 2' rather than 'Expected 4 spaces but found 2 spaces'
                foundStatement = indentType === "space" ? actualSpaces : `${actualSpaces} ${foundSpacesWord}`;
            } else if (actualTabs > 0) {
                foundStatement = indentType === "tab" ? actualTabs : `${actualTabs} ${foundTabsWord}`;
            } else {
                foundStatement = "0";
            }

            return `Expected indentation of ${expectedStatement} but found ${foundStatement}.`;
        }

        /**
         * Get the actual indent of node
         * @param {Token} token Token to examine
         * @returns {Object} The node's indent. Contains keys `space` and `tab`, representing the indent of each character. Also
         contains keys `goodChar` and `badChar`, where `goodChar` is the amount of the user's desired indentation character, and
         `badChar` is the amount of the other indentation character.
         */
        function getTokenIndent(token) {
            const srcCharsBeforeToken = Array.from(sourceCode.getText(token, token.loc.start.column));
            const indentChars = srcCharsBeforeToken.slice(0, srcCharsBeforeToken.findIndex(char => char !== " " && char !== "\t"));
            const spaces = indentChars.filter(char => char === " ").length;
            const tabs = indentChars.filter(char => char === "\t").length;

            return {
                space: spaces,
                tab: tabs,
                goodChar: indentType === "space" ? spaces : tabs,
                badChar: indentType === "space" ? tabs : spaces
            };
        }

        /**
         * Reports a given indent violation
         * @param {Token} token Node violating the indent rule
         * @param {int} neededIndentLevel Expected indentation level
         * @param {int} gottenSpaces Indentation space count in the actual node/code
         * @param {int} gottenTabs Indentation tab count in the actual node/code
         * @returns {void}
         */
        function report(token, neededIndentLevel) {
            const actualIndent = getTokenIndent(token);
            const neededChars = neededIndentLevel * indentSize;

            context.report({
                node: token,
                message: createErrorMessage(neededChars, actualIndent.space, actualIndent.tab),
                loc: {line: token.loc.start.line, column: token.loc.start.column},
                fix: fixer => fixer.replaceTextRange([token.range[0] - actualIndent.space - actualIndent.tab, token.range[0]], (indentType === "space" ? " " : "\t").repeat(neededChars))
            });
        }

        /**
        * Gets the first token on a given token's line
        * @param {Token|ASTNode} token a node or token
        * @returns {Token} The first token on the given line
        */
        function getFirstTokenOfLine(token) {
            return firstTokensByLineNumber.get(token.loc.start.line);
        }

        /**
         * Checks if a token's indentation is correct
         * @param {Token} token Token to examine
         * @param {int} desiredIndentLevel needed indent level
         * @returns {boolean} `true` if the token's indentation is correct
         */
        function validateTokenIndent(token, desiredIndentLevel) {
            const tokenIndent = getTokenIndent(token);

            if (tokenIndent.space && tokenIndent.tab) {

                // To avoid conflicts with no-mixed-spaces-and-tabs, don't report mixed spaces and tabs.
                return true;
            }

            return tokenIndent.goodChar === desiredIndentLevel * indentSize && tokenIndent.badChar === 0;
        }

        /**
        * Sets the desired offset of a token
        * @param {Token} token The token
        * @param {Token} offsetFrom The token that this is offset from
        * @param {number} offset The desired indent level
        * @returns {void}
        */
        function setDesiredOffset(token, offsetFrom, offset) {
            if (!offsetFrom || token.loc.start.line !== offsetFrom.loc.start.line) {
                desiredOffsets.set(token, {offset, from: offsetFrom});
            }
        }

        /**
        * Sets the desired offset of multiple tokens
        * @param {Token} tokens A list of tokens
        * @param {Token} offsetFrom The token that this is offset from
        * @param {number} offset The desired indent level
        * @returns {void}
        */
        function setDesiredOffsets(tokens, offsetFrom, offset) {
            tokens.forEach(token => setDesiredOffset(token, offsetFrom, offset));
        }

        /**
        * Sets the indent of token B to match the indent of token A.
        * @param {Token} tokenA The first token
        * @param {Token} tokenB The second token, whose indent should be matched to the first token
        * @returns {void}
        */
        function matchIndentOf(tokenA, tokenB) {
            setDesiredOffset(tokenB, tokenA, 0);
        }

        /**
        * Gets the desired indent of a token
        * @param {Token} token The token
        * @returns {number} The desired indent of the token
        */
        function getDesiredIndent(token) {
            if (ignoredTokens.has(token)) {
                return (token === getFirstTokenOfLine(token) ? getTokenIndent(token).goodChar / indentSize : getDesiredIndent(getFirstTokenOfLine(token))) + variableDeclaratorOffsets.get(token);
            }
            const offsetInfo = desiredOffsets.get(token);

            return offsetInfo.offset + (offsetInfo.from ? getDesiredIndent(offsetInfo.from) : 0) + variableDeclaratorOffsets.get(token);
        }

        /**
        * Ignores a token, preventing it from being reported.
        * @param {Token} token The token
        * @returns {void}
        */
        function ignoreToken(token) {

            /*
             * FIXME: (not-an-aardvark) Only ignore a token if it's first in the line. Changing this causes the tests to
             * break at the moment for some reason, but it would be best to fix this.
             */
            ignoredTokens.add(token);
        }

        /**
         * Check to see if the node is a file level IIFE
         * @param {ASTNode} node The function node to check.
         * @returns {boolean} True if the node is the outer IIFE
         */
        function isOuterIIFE(node) {
            const parent = node.parent;
            let stmt = parent && parent.parent;

            /*
             * Verify that the node is an IIFE
             */
            if (
                !parent ||
                parent.type !== "CallExpression" ||
                parent.callee !== node) {

                return false;
            }

            /*
             * Navigate legal ancestors to determine whether this IIFE is outer
             */
            while (
                stmt.type === "UnaryExpression" && (
                    stmt.operator === "!" ||
                    stmt.operator === "~" ||
                    stmt.operator === "+" ||
                    stmt.operator === "-") ||
                stmt.type === "AssignmentExpression" ||
                stmt.type === "LogicalExpression" ||
                stmt.type === "SequenceExpression" ||
                stmt.type === "VariableDeclarator") {

                stmt = stmt.parent;
            }

            return (
                (stmt.type === "ExpressionStatement" || stmt.type === "VariableDeclaration") &&
                stmt.parent && stmt.parent.type === "Program"
            );
        }

        const tokensByNodeCache = new Map();

        /**
        * Gets all tokens and comments for a node
        * @param {ASTNode} node The node
        * @returns {Token[]} A list of tokens and comments
        */
        function getTokensAndComments(node) {
            if (!node) {
                return sourceCode.tokensAndComments;
            }

            if (!tokensByNodeCache.has(node)) {
                tokensByNodeCache.set(node, getTokensAndComments(node.parent).filter(token => token.range[0] >= node.range[0] && token.range[1] <= node.range[1]));
            }

            return tokensByNodeCache.get(node);
        }

        /**
         * Check indentation for blocks
         * @param {ASTNode} node node to check
         * @returns {void}
         */
        function addBlockIndent(node) {

            let blockIndentLevel;

            const tokens = getTokensAndComments(node);

            if (node.parent && isOuterIIFE(node.parent)) {
                blockIndentLevel = options.outerIIFEBody;
            } else if (node.parent && (node.parent.type === "FunctionExpression" || node.parent.type === "ArrowFunctionExpression")) {
                blockIndentLevel = options.FunctionExpression.body;
            } else if (node.parent && node.parent.type === "FunctionDeclaration") {
                blockIndentLevel = options.FunctionDeclaration.body;
            } else {
                blockIndentLevel = 1;
            }

            const tokenToMatchAgainst = getFirstTokenOfLine(tokens[0]) === tokens[0] ? tokens[0] : sourceCode.getFirstToken(node.parent);

            matchIndentOf(tokenToMatchAgainst, tokens[0]);
            setDesiredOffsets(tokens.slice(1, -1), tokenToMatchAgainst, blockIndentLevel);
            matchIndentOf(tokenToMatchAgainst, tokens[tokens.length - 1]);
        }

        /**
        * Check indentation for lists of elements (arrays, objects, function params)
        * @param {Token[]} tokens list of tokens
        * @param {ASTNode[]} elements List of elements that should be offset
        * @param {number} offset The amount that the elements should be offset
        * @returns {void}
        */
        function addElementListIndent(tokens, elements, offset) {

            /*
             * FIXME: (not-an-aardvark) Use this for function params as well, I think there are a few incorrect cases for them at the moment
             * e.g. https://github.com/eslint/eslint/issues/6890
             */

            // Run through all the tokens in the list, and offset them by one indent level (mainly for comments, other things will end up overridden)
            setDesiredOffsets(tokens.slice(1, -1), tokens[0], offset);
            elements.slice(1).forEach((element, index) => {

                /*
                 * Match each element to the last token of the previous element.
                 *
                 * [{
                 *    foo: 1
                 * },
                 * { // match the open curly here to the close curly right before it
                 *    bar: 2
                 * }];
                 *
                 *
                 * [{
                 *    foo: 1
                 * }, { // match the open curly here to the close curly right before it
                 *    bar: 2
                 * }];
                 *
                 * [
                 *   {
                 *     foo: 1
                 *   },
                 *   { // match the open curly here to the close curly right before it
                 *     bar: 2
                 *   }
                 * ]
                 *
                 */
                const previousElement = elements[index]; // The previous element is at `index` due to .slice(1) index offset
                const lastTokenOfPreviousElement = previousElement && sourceCode.getLastToken(elements[index]);

                if (previousElement && lastTokenOfPreviousElement === getFirstTokenOfLine(lastTokenOfPreviousElement)) {
                    desiredOffsets.set(sourceCode.getFirstToken(element), {offset: 0, from: lastTokenOfPreviousElement});
                }
            });
            matchIndentOf(tokens[0], tokens[tokens.length - 1]);
        }

        /**
         * Check indent for array block content or object block content
         * @param {ASTNode} node node to examine
         * @returns {void}
         */
        function addArrayOrObjectIndent(node) {
            const tokens = getTokensAndComments(node);

            addElementListIndent(tokens, node.elements || node.properties, 1);
        }

        /**
         * Check and decide whether to check for indentation for blockless nodes
         * Scenarios are for or while statements without braces around them
         * @param {ASTNode} node node to examine
         * @param {ASTNode} parent The parent of the node to examine
         * @returns {void}
         */
        function addBlocklessNodeIndent(node, parent) {
            if (node.type !== "BlockStatement") {
                setDesiredOffsets(getTokensAndComments(node), sourceCode.getFirstToken(parent), 1);
            }
        }

        /**
        * Checks the indentation of a function's parameters
        * @param {ASTNode} node The node
        * @param {number} paramsIndent The indentation level option for the parameters
        * @returns {void}
        */
        function addFunctionParamsIndent(node, paramsIndent) {
            const alltokens = getTokensAndComments(node);

            if (node.params.length) {
                const paramTokens = alltokens.filter(token => token.range[0] >= node.params[0].range[0] && token.range[1] <= node.params[node.params.length - 1].range[1]);

                if (paramsIndent === "first") {
                    const allTokensAfterFirstParam = paramTokens.filter(token => token.range[0] >= node.params[0].range[1]);
                    const firstParamToken = sourceCode.getFirstToken(node.params[0]);

                    if (firstParamToken === getFirstTokenOfLine(firstParamToken)) {
                        ignoreToken(firstParamToken); // If the first param is not on the same line as the function, don't check it.
                    }

                    setDesiredOffsets(allTokensAfterFirstParam, null, firstParamToken.loc.start.column / indentSize);
                } else if (typeof paramsIndent === "number") {
                    setDesiredOffsets(paramTokens, sourceCode.getFirstToken(node), paramsIndent);
                } else {
                    node.params.forEach(param => ignoreToken(sourceCode.getFirstToken(param)));
                }
            }
        }

        /**
        * Adds indentation for the right-hand side of binary/logical expressions.
        * @param {ASTNode} node A BinaryExpression or LogicalExpression node
        * @returns {void}
        */
        function addBinaryOrLogicalExpressionIndent(node) {
            const tokens = getTokensAndComments(node);
            const operator = tokens.find(token => token.range[0] >= node.left.range[1] && token.range[1] <= node.right.range[0] && token.value === node.operator);
            const tokensAfterLeft = tokens.filter(token => token.range[0] >= operator.range[0]);

            /*
             * For backwards compatibility, don't check BinaryExpression indents, e.g.
             * var foo = bar &&
             *                   baz;
             */

            ignoreToken(operator);
            ignoreToken(sourceCode.getTokenAfter(operator));
            setDesiredOffsets(tokensAfterLeft, sourceCode.getFirstToken(node.left), 1);
        }

        /**
        * Checks the indentation of `IfStatement` nodes.
        * @param {ASTNode} node An `IfStatement` node
        * @returns {void}
        */
        function addIfStatementIndent(node) {
            addBlocklessNodeIndent(node.consequent, node);
            if (node.alternate) {
                if (node.alternate.type === "IfStatement") {
                    addIfStatementIndent(node.alternate, node);
                } else {
                    addBlocklessNodeIndent(node.alternate, node);
                }
            }
        }

        /**
        * Checks the indentation for nodes that are like function calls (`CallExpression` and `NewExpression`)
        * @param {ASTNode} node A CallExpression or NewExpression node
        * @returns {void}
        */
        function addFunctionCallIndent(node) {
            const openingParen = node.arguments.length ? sourceCode.getTokenBefore(node.arguments[0]) : sourceCode.getLastToken(node, 1);
            const tokens = getTokensAndComments(node).filter(token => token.range[0] >= openingParen.range[0]);
            const argsTokens = node.arguments.length ? tokens.slice(0, -1).filter(token => token.range[0] >= node.arguments[0].range[0]) : [];

            node.arguments.forEach(arg => ignoreToken(sourceCode.getFirstToken(arg)));
            setDesiredOffsets(argsTokens, sourceCode.getFirstToken(node), 1);
            matchIndentOf(openingParen, tokens[tokens.length - 1]);
        }

        /**
        * Checks the indentation of ClassDeclarations and ClassExpressions
        * @param {ASTNode} node A ClassDeclaration or ClassExpression node
        * @returns {void}
        */
        function addClassIndent(node) {
            const tokens = getTokensAndComments(node);

            setDesiredOffsets(tokens.slice(1, -1), tokens[0], 1);
            matchIndentOf(tokens[0], tokens[tokens.length - 1]);
        }

        /**
        * Checks the indentation of parenthesized values, given a list of tokens in a program
        * @param {Token[]} tokens A list of tokens
        * @returns {void}
        */
        function addParensIndent(tokens) {
            const parenStack = [];
            const parenPairs = [];

            for (const nextToken of tokens) {
                if (nextToken.type === "Punctuator" && nextToken.value === "(") {
                    parenStack.push(nextToken);
                } else if (nextToken.type === "Punctuator" && nextToken.value === ")") {
                    parenPairs.unshift({left: parenStack.pop(), right: nextToken});
                }
            }

            parenPairs.forEach(pair => {
                const leftParen = pair.left;
                const rightParen = pair.right;
                const outerNode = sourceCode.getNodeByRangeIndex(leftParen.range[0]);

                if (
                    outerNode.type !== "FunctionDeclaration" &&
                    outerNode.type !== "FunctionExpression" &&
                    outerNode.type !== "ArrowFunctionExpression" &&
                    outerNode.type !== "CallExpression" &&
                    outerNode.type !== "NewExpression" &&
                    (outerNode.type !== "ExpressionStatement" || outerNode.expression.type !== "CallExpression" || outerNode.expression.callee.type !== "FunctionExpression") &&
                    sourceCode.getTokenAfter(leftParen).loc.start.line > leftParen.loc.start.line
                ) {
                    const parensAndTokens = tokens.filter(token => token.range[0] >= leftParen.range[0] && token.range[1] <= rightParen.range[1]);
                    const parenthesizedTokens = new Set(parensAndTokens.slice(1, -1));

                    parensAndTokens.slice(1, -1).forEach(token => {
                        if (!parenthesizedTokens.has(desiredOffsets.get(token).from)) {
                            setDesiredOffset(token, parensAndTokens[0], 1);
                        }
                    });
                }

                matchIndentOf(leftParen, rightParen);
            });
        }

        return {
            ClassDeclaration: addClassIndent,

            ClassExpression: addClassIndent,

            ConditionalExpression(node) {
                const tokens = getTokensAndComments(node);

                setDesiredOffsets(tokens.slice(1), tokens[0], 1);
            },

            BlockStatement: addBlockIndent,

            WhileStatement: node => addBlocklessNodeIndent(node.body, node),

            ForStatement(node) {
                const forOpeningParen = sourceCode.getFirstToken(node, 1);

                if (node.init) {
                    setDesiredOffsets(getTokensAndComments(node.init), forOpeningParen, 1);
                }
                if (node.test) {
                    setDesiredOffsets(getTokensAndComments(node.test), forOpeningParen, 1);
                }
                if (node.update) {
                    setDesiredOffsets(getTokensAndComments(node.update), forOpeningParen, 1);
                }
                addBlocklessNodeIndent(node.body, node);
            },

            ForInStatement: node => addBlocklessNodeIndent(node.body, node),

            ForOfStatement: node => addBlocklessNodeIndent(node.body, node),

            DoWhileStatement: node => addBlocklessNodeIndent(node.body, node),

            IfStatement: addIfStatementIndent,

            ObjectExpression: addArrayOrObjectIndent,
            ObjectPattern: addArrayOrObjectIndent,

            ArrayExpression: addArrayOrObjectIndent,
            ArrayPattern: addArrayOrObjectIndent,

            MemberExpression(node) {
                const tokens = getTokensAndComments(node);
                const tokensToIndent = tokens.filter(token => token.range[0] >= node.object.range[1]);

                if (typeof options.MemberExpression === "number") {
                    setDesiredOffsets(tokensToIndent, sourceCode.getFirstToken(node.object), options.MemberExpression);
                } else {
                    setDesiredOffsets(tokensToIndent, sourceCode.getFirstToken(node.object), 1);
                    tokensToIndent.forEach(ignoreToken);
                }
            },

            SwitchStatement(node) {
                const tokens = getTokensAndComments(node);
                const openingCurlyIndex = tokens.findIndex(token => token.range[0] >= node.discriminant.range[1] && token.value === "{");

                setDesiredOffsets(tokens.slice(openingCurlyIndex + 1, -1), tokens[openingCurlyIndex], options.SwitchCase);

                const caseKeywords = new Set(node.cases.map(switchCase => sourceCode.getFirstToken(switchCase)));
                const lastCaseKeyword = node.cases.length && sourceCode.getFirstToken(node.cases[node.cases.length - 1]);
                const casesWithBlocks = new Set(node.cases.filter(switchCase => switchCase.consequent.length === 1 && switchCase.consequent[0].type === "BlockStatement").map(switchCase => sourceCode.getFirstToken(switchCase)));
                let lastAnchor = tokens[openingCurlyIndex];

                tokens.slice(openingCurlyIndex + 1, -1).forEach(token => {
                    if (caseKeywords.has(token)) {
                        lastAnchor = token;
                    } else if (lastAnchor === lastCaseKeyword && (token.type === "Line" || token.type === "Block")) {
                        ignoreToken(token);
                    } else if (!casesWithBlocks.has(lastAnchor)) {
                        setDesiredOffset(token, lastAnchor, 1);
                    }
                });
            },

            FunctionDeclaration(node) {
                addFunctionParamsIndent(node, options.FunctionDeclaration.parameters);
            },

            CallExpression: addFunctionCallIndent,

            NewExpression: addFunctionCallIndent,

            FunctionExpression(node) {
                addFunctionParamsIndent(node, options.FunctionExpression.parameters);
            },

            ArrowFunctionExpression(node) {
                addFunctionParamsIndent(node, options.FunctionExpression.parameters);
                if (node.body.type !== "BlockStatement") {
                    setDesiredOffsets(getTokensAndComments(node.body), sourceCode.getFirstToken(node), 1);
                }
            },

            BinaryExpression: addBinaryOrLogicalExpressionIndent,
            LogicalExpression: addBinaryOrLogicalExpressionIndent,

            VariableDeclaration(node) {
                setDesiredOffsets(getTokensAndComments(node).slice(1), sourceCode.getFirstToken(node), options.VariableDeclarator[node.kind]);
            },

            VariableDeclarator(node) {
                if (node.init) {
                    ignoreToken(sourceCode.getFirstToken(node.init));
                }
            },

            "VariableDeclarator:exit"(node) {
                if (node.parent.declarations.length > 1 && node.parent.declarations[0] === node && node.init) {
                    new Set(getTokensAndComments(node.init)).forEach((token, _, set) => {
                        if (!set.has(desiredOffsets.get(token).from)) {
                            variableDeclaratorOffsets.set(token, variableDeclaratorOffsets.get(token) + options.VariableDeclarator[node.parent.kind]);
                        }
                    });
                }
            },

            AssignmentExpression(node) {
                const operator = sourceCode.getTokensBetween(node.left, node.right).find(token => token.value === node.operator);
                const tokensFromOperator = getTokensAndComments(node).filter(token => token.range[0] >= operator.range[0]);

                setDesiredOffsets(tokensFromOperator, sourceCode.getFirstToken(node.left), 1);
                ignoreToken(tokensFromOperator[0]);
                ignoreToken(tokensFromOperator[1]);
            },

            Property(node) {
                if (!node.computed && !node.shorthand && !node.method && node.kind === "init") {
                    const colon = sourceCode.getTokensBetween(node.key, node.value).find(token => token.value === ":");

                    ignoreToken(sourceCode.getTokenAfter(colon));
                }
            },

            TemplateLiteral(node) {
                const tokens = getTokensAndComments(node);
                const firstBacktick = sourceCode.getFirstToken(node);

                setDesiredOffsets(tokens.slice(1, -1), firstBacktick, 1);

                node.quasis.filter(quasi => !quasi.tail).forEach(quasi => {
                    setDesiredOffsets(tokens.filter(token => token.range[0] >= quasi.range[0] && token.range[1] <= quasi.range[1]), firstBacktick, 0);
                });

                matchIndentOf(firstBacktick, sourceCode.getLastToken(node));
            },

            "Program:exit"() {
                addParensIndent(Array.from(desiredOffsets.keys()));
                sourceCode.ast.tokens.forEach(token => {
                    const tokenIndent = getDesiredIndent(token);

                    if (token === getFirstTokenOfLine(token) && !validateTokenIndent(token, tokenIndent)) {
                        report(token, tokenIndent);
                    }
                });

                const precedingTokens = new Map();

                sourceCode.tokensAndComments.reduce((latestToken, tokenOrComment) => {
                    if (tokenOrComment.type === "Line" || tokenOrComment.type === "Block") {
                        precedingTokens.set(tokenOrComment, latestToken);
                        return latestToken;
                    }
                    return tokenOrComment;
                }, null);

                /*
                 * TODO: (not-an-aardvark) Clean this part up, I think it's more complicated than it needs to be.
                 * Basically, each comment can either have (a) the indentation that was calculated as if it was a token,
                 * (b) the same indentation as the token before it, or (c) the same indentation as the token after it.
                 */
                sourceCode.ast.comments.forEach(comment => {
                    const isFirstInLine = !sourceCode.getText().slice(comment.range[0] - comment.loc.start.column, comment.range[0]).trim();
                    const tokenBefore = precedingTokens.get(comment) && getFirstTokenOfLine(precedingTokens.get(comment));
                    const immediateTokenAfter = tokenBefore ? sourceCode.getTokenAfter(precedingTokens.get(comment)) : sourceCode.ast.tokens[0];
                    const tokenAfter = immediateTokenAfter && getFirstTokenOfLine(immediateTokenAfter);
                    const matchesTokenBeforeIndent = tokenBefore && validateTokenIndent(comment, getDesiredIndent(tokenBefore));
                    const matchesTokenAfterIndent = tokenAfter && validateTokenIndent(comment, getDesiredIndent(tokenAfter));
                    const matchesNoTokensIndent = validateTokenIndent(comment, getDesiredIndent(comment));

                    if (isFirstInLine && !matchesTokenBeforeIndent && !matchesTokenAfterIndent && !matchesNoTokensIndent) {
                        report(comment, tokenBefore || tokenAfter ? getDesiredIndent(tokenBefore || tokenAfter) : 0);
                    }
                });
            }
        };

    }
};
