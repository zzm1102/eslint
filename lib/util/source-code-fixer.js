/**
 * @fileoverview An object that caches and applies source code fixes.
 * @author Nicholas C. Zakas
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const debug = require("debug")("eslint:text-fixer");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const BOM = "\uFEFF";

/**
 * Compares items in a messages array by line and column.
 * @param {Message} a The first message.
 * @param {Message} b The second message.
 * @returns {int} -1 if a comes before b, 1 if a comes after b, 0 if equal.
 * @private
 */
function compareMessagesByLocation(a, b) {
    const lineDiff = a.line - b.line;

    if (lineDiff === 0) {
        return a.column - b.column;
    } else {
        return lineDiff;
    }
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Utility for apply fixes to source code.
 * @constructor
 */
function SourceCodeFixer() {
    Object.freeze(this);
}

/**
 * Applies the fixes specified by the messages to the given text. Tries to be
 * smart about the fixes and won't apply fixes over the same area in the text.
 * @param {SourceCode} sourceCode The source code to apply the changes to.
 * @param {Message[]} messages The array of messages reported by ESLint.
 * @returns {Object} An object containing the fixed text and any unfixed messages.
 */
SourceCodeFixer.applyFixes = function(sourceCode, messages) {

    debug("Applying fixes");

    if (!sourceCode) {
        debug("No source code to fix");
        return {
            fixed: false,
            messages,
            output: ""
        };
    }

    // clone the array
    const remainingMessages = [];
    const problems = [];
    let text = sourceCode.text;
    let prefix = (sourceCode.hasBOM ? BOM : "");

    messages.forEach(function(problem) {
        if (problem.hasOwnProperty("fix")) {
            problems.push(problem);
        } else {
            remainingMessages.push(problem);
        }
    });

    if (problems.length) {
        debug("Found fixes to apply");

        const allFixes = problems.reduce((fixes, problem) => fixes.concat(problem.fix), []).sort((a, b) => a.range[1] - b.range[1] || a.range[0] - b.range[0]);
        let lastFixPos = Infinity;
        const fixesToApply = allFixes.reduceRight((fixes, fix) => {

            // If a fix conflicts with a previous fix, don't apply it.
            if (fix.range[1] < lastFixPos) {
                fixes.add(fix);
                lastFixPos = fix.range[0];
            }
            return fixes;
        }, new Set());

        problems.forEach(problem => {
            const fixes = [].concat(problem.fix);

            if (!fixes.every(fix => fixesToApply.has(fix))) {

                // If not every fix for a given problem can be applied, don't apply any of the fixes.
                fixes.filter(fix => fixesToApply.has(fix)).forEach(fix => fixesToApply.delete(fix));
                remainingMessages.push(problem);
            }
        });

        allFixes.filter(fix => fixesToApply.has(fix)).reverse().forEach(fix => {
            let start = fix.range[0];
            const end = fix.range[1];
            let insertionText = fix.text;

            if (start < 0) {

                // Remove BOM.
                prefix = "";
                start = 0;
            }

            if (start === 0 && insertionText[0] === BOM) {

                // Set BOM.
                prefix = BOM;
                insertionText = insertionText.slice(1);
            }

            text = text.slice(0, start) + insertionText + text.slice(end);
        });

        return {
            fixed: true,
            messages: remainingMessages.sort(compareMessagesByLocation),
            output: prefix + text
        };
    } else {
        debug("No fixes to apply");
        return {
            fixed: false,
            messages,
            output: prefix + text
        };
    }
};

module.exports = SourceCodeFixer;
