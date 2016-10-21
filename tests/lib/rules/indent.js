/**
 * @fileoverview This option sets a specific tab width for your code
 * @author Dmitriy Shekhovtsov
 * @author Gyandeep Singh
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/indent"),
    RuleTester = require("../../../lib/testers/rule-tester");
const fs = require("fs");
const path = require("path");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const fixture = fs.readFileSync(path.join(__dirname, "../../fixtures/rules/indent/indent-invalid-fixture-1.js"), "utf8");
const fixedFixture = fs.readFileSync(path.join(__dirname, "../../fixtures/rules/indent/indent-valid-fixture-1.js"), "utf8");

/**
 * Create error message object for failure cases with a single 'found' indentation type
 * @param {string} indentType indent type of string or tab
 * @param {array} errors error info
 * @returns {Object} returns the error messages collection
 * @private
 */
function expectedErrors(indentType, errors) {
    if (Array.isArray(indentType)) {
        errors = indentType;
        indentType = "space";
    }

    if (!errors[0].length) {
        errors = [errors];
    }

    return errors.map(function(err) {
        let message;

        if (typeof err[1] === "string" && typeof err[2] === "string") {
            message = `Expected indentation of ${err[1]} but found ${err[2]}.`;
        } else {
            const chars = indentType + (err[1] === 1 ? "" : "s");

            message = `Expected indentation of ${err[1]} ${chars} but found ${err[2]}.`;
        }
        return {message, type: err[3], line: err[0]};
    });
}

const ruleTester = new RuleTester();

ruleTester.run("indent", rule, {
    valid: [
        {
            code:
            "bridge.callHandler(\n" +
            "  'getAppVersion', 'test23', function(responseData) {\n" +
            "    window.ah.mobileAppVersion = responseData;\n" +
            "  }\n" +
            ");\n",
            options: [2]
        },
        {
            code:
            "bridge.callHandler(\n" +
            "  'getAppVersion', 'test23', function(responseData) {\n" +
            "    window.ah.mobileAppVersion = responseData;\n" +
            "  });\n",
            options: [2]
        },
        {
            code:
            "bridge.callHandler(\n" +
            "  'getAppVersion',\n" +
            "  null,\n" +
            "  function responseCallback(responseData) {\n" +
            "    window.ah.mobileAppVersion = responseData;\n" +
            "  }\n" +
            ");\n",
            options: [2]
        },
        {
            code:
            "bridge.callHandler(\n" +
            "  'getAppVersion',\n" +
            "  null,\n" +
            "  function responseCallback(responseData) {\n" +
            "    window.ah.mobileAppVersion = responseData;\n" +
            "  });\n",
            options: [2]
        },
        {
            code:
            "function doStuff(keys) {\n" +
            "    _.forEach(\n" +
            "        keys,\n" +
            "        key => {\n" +
            "            doSomething(key);\n" +
            "        }\n" +
            "    );\n" +
            "}\n",
            options: [4],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code:
            "example(\n" +
            "    function () {\n" +
            "        console.log('example');\n" +
            "    }\n" +
            ");\n",
            options: [4]
        },
        {
            code:
            "let foo = somethingList\n" +
            "    .filter(x => {\n" +
            "        return x;\n" +
            "    })\n" +
            "    .map(x => {\n" +
            "        return 100 * x;\n" +
            "    });\n",
            options: [4],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code:
            "var x = 0 &&\n" +
            "    {\n" +
            "        a: 1,\n" +
            "        b: 2\n" +
            "    };",
            options: [4]
        },
        {
            code:
            "var x = 0 &&\n" +
            "\t{\n" +
            "\t\ta: 1,\n" +
            "\t\tb: 2\n" +
            "\t};",
            options: ["tab"]
        },
        {
            code:
            "var x = 0 &&\n" +
            "    {\n" +
            "        a: 1,\n" +
            "        b: 2\n" +
            "    }||\n" +
            "    {\n" +
            "        c: 3,\n" +
            "        d: 4\n" +
            "    };",
            options: [4]
        },
        {
            code:
            "var x = 0 && 1;",
            options: [4]
        },
        {
            code:
            "var x = 0 && { a: 1, b: 2 };",
            options: [4]
        },
        {
            code:
            "var x = 0 &&\n" +
            "    (\n" +
            "        1\n" +
            "    );",
            options: [4]
        },
        {
            code:
            "var x = 0 && { a: 1, b: 2 };",
            options: [4]
        },
        {
            code:
            "require('http').request({hostname: 'localhost',\n" +
            "  port: 80}, function(res) {\n" +
            "    res.end();\n" +
            "  });\n",
            options: [2]
        },
        {
            code:
            "function test() {\n" +
            "  return client.signUp(email, PASSWORD, { preVerified: true })\n" +
            "    .then(function (result) {\n" +
            "      // hi\n" +
            "    })\n" +
            "    .then(function () {\n" +
            "      return FunctionalHelpers.clearBrowserState(self, {\n" +
            "        contentServer: true,\n" +
            "        contentServer1: true\n" +
            "      });\n" +
            "    });\n" +
            "}",
            options: [2]
        },
        {
            code:
            "it('should... some lengthy test description that is forced to be' +\n" +
            "  'wrapped into two lines since the line length limit is set', () => {\n" +
            "    expect(true).toBe(true);\n" +
            "  });\n",
            options: [2],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code:
            "function test() {\n" +
            "    return client.signUp(email, PASSWORD, { preVerified: true })\n" +
            "        .then(function (result) {\n" +
            "            var x = 1;\n" +
            "            var y = 1;\n" +
            "        }, function(err){\n" +
            "            var o = 1 - 2;\n" +
            "            var y = 1 - 2;\n" +
            "            return true;\n" +
            "        })\n" +
            "}",
            options: [4]
        },
        {
            code:
            "function test() {\n" +
            "    return client.signUp(email, PASSWORD, { preVerified: true })\n" +
            "    .then(function (result) {\n" +
            "        var x = 1;\n" +
            "        var y = 1;\n" +
            "    }, function(err){\n" +
            "        var o = 1 - 2;\n" +
            "        var y = 1 - 2;\n" +
            "        return true;\n" +
            "    });\n" +
            "}",
            options: [4, {MemberExpression: 0}]
        },

        {
            code:
            "// hi",
            options: [2, {VariableDeclarator: 1, SwitchCase: 1}]
        },
        {
            code:
            "var Command = function() {\n" +
            "  var fileList = [],\n" +
            "      files = []\n" +
            "\n" +
            "  files.concat(fileList)\n" +
            "};\n",
            options: [2, {VariableDeclarator: { var: 2, let: 2, const: 3}}]
        },
        {
            code:
                "  ",
            options: [2, {VariableDeclarator: 1, SwitchCase: 1}]
        },
        {
            code:
            "if(data) {\n" +
            "  console.log('hi');\n" +
            "  b = true;};",
            options: [2, {VariableDeclarator: 1, SwitchCase: 1}]
        },
        {
            code:
            "foo = () => {\n" +
            "  console.log('hi');\n" +
            "  return true;};",
            options: [2, {VariableDeclarator: 1, SwitchCase: 1}],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code:
            "function test(data) {\n" +
            "  console.log('hi');\n" +
            "  return true;};",
            options: [2, {VariableDeclarator: 1, SwitchCase: 1}]
        },
        {
            code:
            "var test = function(data) {\n" +
            "  console.log('hi');\n" +
            "};",
            options: [2, {VariableDeclarator: 1, SwitchCase: 1}]
        },
        {
            code:
            "arr.forEach(function(data) {\n" +
            "  otherdata.forEach(function(zero) {\n" +
            "    console.log('hi');\n" +
            "  }) });",
            options: [2, {VariableDeclarator: 1, SwitchCase: 1}]
        },
        {
            code:
            "a = [\n" +
            "    ,3\n" +
            "]",
            options: [4, {VariableDeclarator: 1, SwitchCase: 1}]
        },
        {
            code:
            "[\n" +
            "  ['gzip', 'gunzip'],\n" +
            "  ['gzip', 'unzip'],\n" +
            "  ['deflate', 'inflate'],\n" +
            "  ['deflateRaw', 'inflateRaw'],\n" +
            "].forEach(function(method) {\n" +
            "  console.log(method);\n" +
            "});\n",
            options: [2, {SwitchCase: 1, VariableDeclarator: 2}]
        },
        {
            code:
            "test(123, {\n" +
            "    bye: {\n" +
            "        hi: [1,\n" +
            "            {\n" +
            "                b: 2\n" +
            "            }\n" +
            "        ]\n" +
            "    }\n" +
            "});",
            options: [4, {VariableDeclarator: 1, SwitchCase: 1}]
        },
        {
            code:
            "var xyz = 2,\n" +
            "    lmn = [\n" +
            "        {\n" +
            "            a: 1\n" +
            "        }\n" +
            "    ];",
            options: [4, {VariableDeclarator: 1, SwitchCase: 1}]
        },
        {
            code:
            "lmnn = [{\n" +
            "    a: 1\n" +
            "},\n" +
            "{\n" +
            "    b: 2\n" +
            "}, {\n" +
            "    x: 2\n" +
            "}];",
            options: [4, {VariableDeclarator: 1, SwitchCase: 1}]
        },
        {
            code:
            "[{\n" +
            "    foo: 1\n" +
            "}, {\n" +
            "    foo: 2\n" +
            "}, {\n" +
            "    foo: 3\n" +
            "}]"
        },
        {
            code:
            "foo([\n" +
            "    bar\n" +
            "], [\n" +
            "    baz\n" +
            "], [\n" +
            "    qux\n" +
            "]);"
        },
        {
            code:
            "abc({\n" +
            "    test: [\n" +
            "        [\n" +
            "            c,\n" +
            "            xyz,\n" +
            "            2\n" +
            "        ].join(',')\n" +
            "    ]\n" +
            "});",
            options: [4, {VariableDeclarator: 1, SwitchCase: 1}]
        },
        {
            code:
            "abc = {\n" +
            "  test: [\n" +
            "    [\n" +
            "      c,\n" +
            "      xyz,\n" +
            "      2\n" +
            "    ]\n" +
            "  ]\n" +
            "};",
            options: [2, {VariableDeclarator: 1, SwitchCase: 1}]
        },
        {
            code:
            "abc(\n" +
            "  {\n" +
            "    a: 1,\n" +
            "    b: 2\n" +
            "  }\n" +
            ");",
            options: [2, {VariableDeclarator: 1, SwitchCase: 1}]
        },
        {
            code:
            "abc({\n" +
            "    a: 1,\n" +
            "    b: 2\n" +
            "});",
            options: [4, {VariableDeclarator: 1, SwitchCase: 1}]
        },
        {
            code:
            "var abc = \n" +
            "  [\n" +
            "    c,\n" +
            "    xyz,\n" +
            "    {\n" +
            "      a: 1,\n" +
            "      b: 2\n" +
            "    }\n" +
            "  ];",
            options: [2, {VariableDeclarator: 1, SwitchCase: 1}]
        },
        {
            code:
            "var abc = [\n" +
            "  c,\n" +
            "  xyz,\n" +
            "  {\n" +
            "    a: 1,\n" +
            "    b: 2\n" +
            "  }\n" +
            "];",
            options: [2, {VariableDeclarator: 1, SwitchCase: 1}]
        },
        {
            code:
            "var abc = 5,\n" +
            "    c = 2,\n" +
            "    xyz = \n" +
            "    {\n" +
            "      a: 1,\n" +
            "      b: 2\n" +
            "    };",
            options: [2, {VariableDeclarator: 2, SwitchCase: 1}]
        },
        {
            code:
            "var foo = 1,\n" +
            "  bar =\n" +
            "    2",
            options: [2, {VariableDeclarator: 1}]
        },
        {
            code:
            "var abc = \n" +
            "    {\n" +
            "      a: 1,\n" +
            "      b: 2\n" +
            "    };",
            options: [2, {VariableDeclarator: 2, SwitchCase: 1}]
        },
        {
            code:
            "var a = new abc({\n" +
            "        a: 1,\n" +
            "        b: 2\n" +
            "    }),\n" +
            "    b = 2;",
            options: [4, {VariableDeclarator: 1, SwitchCase: 1}]
        },
        {
            code:
            "var a = 2,\n" +
            "  c = {\n" +
            "    a: 1,\n" +
            "    b: 2\n" +
            "  },\n" +
            "  b = 2;",
            options: [2, {VariableDeclarator: 1, SwitchCase: 1}]
        },
        {
            code:
            "var x = 2,\n" +
            "    y = {\n" +
            "      a: 1,\n" +
            "      b: 2\n" +
            "    },\n" +
            "    b = 2;",
            options: [2, {VariableDeclarator: 2, SwitchCase: 1}]
        },
        {
            code:
            "var e = {\n" +
            "      a: 1,\n" +
            "      b: 2\n" +
            "    },\n" +
            "    b = 2;",
            options: [2, {VariableDeclarator: 2, SwitchCase: 1}]
        },
        {
            code:
            "var a = {\n" +
            "  a: 1,\n" +
            "  b: 2\n" +
            "};",
            options: [2, {VariableDeclarator: 2, SwitchCase: 1}]
        },
        {
            code:
            "function test() {\n" +
            "  if (true ||\n " +
            "            false){\n" +
            "    console.log(val);\n" +
            "  }\n" +
            "}",
            options: [2, {VariableDeclarator: 2, SwitchCase: 1}]
        },
        {
            code:
            "var foo = bar ||\n" +
            "    !(\n" +
            "        baz\n" +
            "    );"
        },
        {
            code:
            "for (var foo = 1;\n" +
            "    foo < 10;\n" +
            "    foo++) {}",
        },
        {
            code:
            "for (\n" +
            "    var foo = 1;\n" +
            "    foo < 10;\n" +
            "    foo++\n" +
            ") {}"
        },
        {
            code:
            "for (var val in obj)\n" +
            "  if (true)\n" +
            "    console.log(val);",
            options: [2, {VariableDeclarator: 2, SwitchCase: 1}]
        },
        {
            code:
            "if(true)\n" +
            "  if (true)\n" +
            "    if (true)\n" +
            "      console.log(val);",
            options: [2, {VariableDeclarator: 2, SwitchCase: 1}]
        },
        {
            code:
            "function hi(){     var a = 1;\n" +
            "  y++;                   x++;\n" +
            "}",
            options: [2, {VariableDeclarator: 2, SwitchCase: 1}]
        },
        {
            code:
            "for(;length > index; index++)if(NO_HOLES || index in self){\n" +
            "  x++;\n" +
            "}",
            options: [2, {VariableDeclarator: 2, SwitchCase: 1}]
        },
        {
            code:
            "function test(){\n" +
            "  switch(length){\n" +
            "    case 1: return function(a){\n" +
            "      return fn.call(that, a);\n" +
            "    };\n" +
            "  }\n" +
            "}",
            options: [2, {VariableDeclarator: 2, SwitchCase: 1}]
        },
        {
            code:
            "var geometry = 2,\n" +
            "rotate = 2;",
            options: [2, {VariableDeclarator: 0}]
        },
        {
            code:
            "var geometry,\n" +
            "    rotate;",
            options: [4, {VariableDeclarator: 1}]
        },
        {
            code:
            "var geometry,\n" +
            "\trotate;",
            options: ["tab", {VariableDeclarator: 1}]
        },
        {
            code:
            "var geometry,\n" +
            "  rotate;",
            options: [2, {VariableDeclarator: 1}]
        },
        {
            code:
            "var geometry,\n" +
            "    rotate;",
            options: [2, {VariableDeclarator: 2}]
        },
        {
            code:
            "let geometry,\n" +
            "    rotate;",
            options: [2, {VariableDeclarator: 2}],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code:
            "const geometry = 2,\n" +
            "    rotate = 3;",
            options: [2, {VariableDeclarator: 2}],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code:
            "var geometry, box, face1, face2, colorT, colorB, sprite, padding, maxWidth,\n" +
            "  height, rotate;",
            options: [2, {SwitchCase: 1}]
        },
        {
            code:
            "var geometry, box, face1, face2, colorT, colorB, sprite, padding, maxWidth;",
            options: [2, {SwitchCase: 1}]
        },
        {
            code:
            "if (1 < 2){\n" +
            "//hi sd \n" +
            "}",
            options: [2]
        },
        {
            code:
            "while (1 < 2){\n" +
            "  //hi sd \n" +
            "}",
            options: [2]
        },
        {
            code:
            "while (1 < 2) console.log('hi');",
            options: [2]
        },
        {
            code:
            "[a, b, \n" +
            "    c].forEach((index) => {\n" +
            "        index;\n" +
            "    });\n",
            options: [4],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code:
            "[a, b, \n" +
            "    c].forEach(function(index){\n" +
            "        return index;\n" +
            "    });\n",
            options: [4],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code:
            "[a, b, c].forEach((index) => {\n" +
            "    index;\n" +
            "});\n",
            options: [4],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code:
            "[a, b, c].forEach(function(index){\n" +
            "    return index;\n" +
            "});\n",
            options: [4],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code:
            "switch (x) {\n" +
            "    case \"foo\":\n" +
            "        a();\n" +
            "        break;\n" +
            "    case \"bar\":\n" +
            "        switch (y) {\n" +
            "            case \"1\":\n" +
            "                break;\n" +
            "            case \"2\":\n" +
            "                a = 6;\n" +
            "                break;\n" +
            "        }\n" +
            "    case \"test\":\n" +
            "        break;\n" +
            "}",
            options: [4, {SwitchCase: 1}]
        },
        {
            code:
            "switch (x) {\n" +
            "        case \"foo\":\n" +
            "            a();\n" +
            "            break;\n" +
            "        case \"bar\":\n" +
            "            switch (y) {\n" +
            "                    case \"1\":\n" +
            "                        break;\n" +
            "                    case \"2\":\n" +
            "                        a = 6;\n" +
            "                        break;\n" +
            "            }\n" +
            "        case \"test\":\n" +
            "            break;\n" +
            "}",
            options: [4, {SwitchCase: 2}]
        },
        {
            code:
            "switch (a) {\n" +
            "case \"foo\":\n" +
            "    a();\n" +
            "    break;\n" +
            "case \"bar\":\n" +
            "    switch(x){\n" +
            "    case '1':\n" +
            "        break;\n" +
            "    case '2':\n" +
            "        a = 6;\n" +
            "        break;\n" +
            "    }\n" +
            "}"
        },
        {
            code:
            "switch (a) {\n" +
            "case \"foo\":\n" +
            "    a();\n" +
            "    break;\n" +
            "case \"bar\":\n" +
            "    if(x){\n" +
            "        a = 2;\n" +
            "    }\n" +
            "    else{\n" +
            "        a = 6;\n" +
            "    }\n" +
            "}"
        },
        {
            code:
            "switch (a) {\n" +
            "case \"foo\":\n" +
            "    a();\n" +
            "    break;\n" +
            "case \"bar\":\n" +
            "    if(x){\n" +
            "        a = 2;\n" +
            "    }\n" +
            "    else\n" +
            "        a = 6;\n" +
            "}"
        },
        {
            code:
            "switch (a) {\n" +
            "case \"foo\":\n" +
            "    a();\n" +
            "    break;\n" +
            "case \"bar\":\n" +
            "    a(); break;\n" +
            "case \"baz\":\n" +
            "    a(); break;\n" +
            "}"
        },
        {
            code: "switch (0) {\n}"
        },
        {
            code:
            "function foo() {\n" +
            "    var a = \"a\";\n" +
            "    switch(a) {\n" +
            "    case \"a\":\n" +
            "        return \"A\";\n" +
            "    case \"b\":\n" +
            "        return \"B\";\n" +
            "    }\n" +
            "}\n" +
            "foo();"
        },
        {
            code:
            "switch(value){\n" +
            "    case \"1\":\n" +
            "    case \"2\":\n" +
            "        a();\n" +
            "        break;\n" +
            "    default:\n" +
            "        a();\n" +
            "        break;\n" +
            "}\n" +
            "switch(value){\n" +
            "    case \"1\":\n" +
            "        a();\n" +
            "        break;\n" +
            "    case \"2\":\n" +
            "        break;\n" +
            "    default:\n" +
            "        break;\n" +
            "}",
            options: [4, {SwitchCase: 1}]
        },
        {
            code:
                "var obj = {foo: 1, bar: 2};\n" +
                "with (obj) {\n" +
                "    console.log(foo + bar);\n" +
                "}\n"
        },
        {
            code:
                "if (a) {\n" +
                "    (1 + 2 + 3);\n" + // no error on this line
                "}"
        },
        {
            code:
                "switch(value){ default: a(); break; }\n"
        },
        {
            code: "import {addons} from 'react/addons'\nimport React from 'react'",
            options: [2],
            parserOptions: { sourceType: "module" }
        },
        {
            code:
            "var a = 1,\n" +
            "    b = 2,\n" +
            "    c = 3;\n",
            options: [4]
        },
        {
            code:
            "var a = 1\n" +
            "    ,b = 2\n" +
            "    ,c = 3;\n",
            options: [4]
        },
        {
            code: "while (1 < 2) console.log('hi')\n",
            options: [2]
        },
        {
            code:
                "function salutation () {\n" +
                "  switch (1) {\n" +
                "    case 0: return console.log('hi')\n" +
                "    case 1: return console.log('hey')\n" +
                "  }\n" +
                "}\n",
            options: [2, { SwitchCase: 1 }]
        },
        {
            code:
                "var items = [\n" +
                "  {\n" +
                "    foo: 'bar'\n" +
                "  }\n" +
                "];\n",
            options: [2, {VariableDeclarator: 2}]
        },
        {
            code:
                "const a = 1,\n" +
                "      b = 2;\n" +
                "const items1 = [\n" +
                "  {\n" +
                "    foo: 'bar'\n" +
                "  }\n" +
                "];\n" +
                "const items2 = Items(\n" +
                "  {\n" +
                "    foo: 'bar'\n" +
                "  }\n" +
                ");\n",
            options: [2, {VariableDeclarator: 3}],
            parserOptions: { ecmaVersion: 6 }

        },
        {
            code:
                "const geometry = 2,\n" +
                "      rotate = 3;\n" +
                "var a = 1,\n" +
                "  b = 2;\n" +
                "let light = true,\n" +
                "    shadow = false;",
            options: [2, { VariableDeclarator: { const: 3, let: 2 } }],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code:
            "const abc = 5,\n" +
            "      c = 2,\n" +
            "      xyz = \n" +
            "      {\n" +
            "        a: 1,\n" +
            "        b: 2\n" +
            "      };\n" +
            "let abc = 5,\n" +
            "  c = 2,\n" +
            "  xyz = \n" +
            "  {\n" +
            "    a: 1,\n" +
            "    b: 2\n" +
            "  };\n" +
            "var abc = 5,\n" +
            "    c = 2,\n" +
            "    xyz = \n" +
            "    {\n" +
            "      a: 1,\n" +
            "      b: 2\n" +
            "    };\n",
            options: [2, { VariableDeclarator: { var: 2, const: 3 }, SwitchCase: 1}],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code:
                "module.exports = {\n" +
                "  'Unit tests':\n" +
                "  {\n" +
                "    rootPath: './',\n" +
                "    environment: 'node',\n" +
                "    tests:\n" +
                "    [\n" +
                "      'test/test-*.js'\n" +
                "    ],\n" +
                "    sources:\n" +
                "    [\n" +
                "      '*.js',\n" +
                "      'test/**.js'\n" +
                "    ]\n" +
                "  }\n" +
                "};",
            options: [2]
        },
        {
            code:
            "foo =\n" +
            "  bar;",
            options: [2]
        },
        {
            code:
            "foo = (\n" +
            "  bar\n" +
            ");",
            options: [2]
        },
        {
            code:
                "var path     = require('path')\n" +
                "  , crypto    = require('crypto')\n" +
                "  ;\n",
            options: [2]
        },
        {
            code:
                "var a = 1\n" +
                "    ,b = 2\n" +
                "    ;"
        },
        {
            code:
                "export function create (some,\n" +
                "                        argument) {\n" +
                "  return Object.create({\n" +
                "    a: some,\n" +
                "    b: argument\n" +
                "  });\n" +
                "};",
            parserOptions: { sourceType: "module" },
            options: [2]
        },
        {
            code:
                "export function create (id, xfilter, rawType,\n" +
                "                        width=defaultWidth, height=defaultHeight,\n" +
                "                        footerHeight=defaultFooterHeight,\n" +
                "                        padding=defaultPadding) {\n" +
                "  // ... function body, indented two spaces\n" +
                "}\n",
            parserOptions: { sourceType: "module" },
            options: [2]
        },
        {
            code:
                "var obj = {\n" +
                "  foo: function () {\n" +
                "    return new p()\n" +
                "      .then(function (ok) {\n" +
                "        return ok;\n" +
                "      }, function () {\n" +
                "        // ignore things\n" +
                "      });\n" +
                "  }\n" +
                "};\n",
            options: [2]
        },
        {
            code:
                "a.b()\n" +
                "  .c(function(){\n" +
                "    var a;\n" +
                "  }).d.e;\n",
            options: [2]
        },
        {
            code:
                "const YO = 'bah',\n" +
                "      TE = 'mah'\n" +
                "\n" +
                "var res,\n" +
                "    a = 5,\n" +
                "    b = 4\n",
            parserOptions: { ecmaVersion: 6 },
            options: [2, {VariableDeclarator: { var: 2, let: 2, const: 3}}]
        },
        {
            code:
                "const YO = 'bah',\n" +
                "      TE = 'mah'\n" +
                "\n" +
                "var res,\n" +
                "    a = 5,\n" +
                "    b = 4\n" +
                "\n" +
                "if (YO) console.log(TE)",
            parserOptions: { ecmaVersion: 6 },
            options: [2, {VariableDeclarator: { var: 2, let: 2, const: 3}}]
        },
        {
            code:
                "var foo = 'foo',\n" +
                "  bar = 'bar',\n" +
                "  baz = function() {\n" +
                "      \n" +
                "  }\n" +
                "\n" +
                "function hello () {\n" +
                "    \n" +
                "}\n",
            options: [2]
        },
        {
            code:
                "var obj = {\n" +
                "  send: function () {\n" +
                "    return P.resolve({\n" +
                "      type: 'POST'\n" +
                "    })\n" +
                "      .then(function () {\n" +
                "        return true;\n" +
                "      }, function () {\n" +
                "        return false;\n" +
                "      });\n" +
                "  }\n" +
                "};\n",
            options: [2]
        },
        {
            code:
                "var obj = {\n" +
                "  send: function () {\n" +
                "    return P.resolve({\n" +
                "      type: 'POST'\n" +
                "    })\n" +
                "    .then(function () {\n" +
                "      return true;\n" +
                "    }, function () {\n" +
                "      return false;\n" +
                "    });\n" +
                "  }\n" +
                "};\n",
            options: [2, {MemberExpression: 0}]
        },
        {
            code:
                "const someOtherFunction = argument => {\n" +
                "        console.log(argument);\n" +
                "    },\n" +
                "    someOtherValue = 'someOtherValue';\n",
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code:
            "[\n" +
            "  'a',\n" +
            "  'b'\n" +
            "].sort().should.deepEqual([\n" +
            "  'x',\n" +
            "  'y'\n" +
            "]);\n",
            options: [2]
        },
        {
            code:
            "var a = 1,\n" +
            "    B = class {\n" +
            "      constructor(){}\n" +
            "      a(){}\n" +
            "      get b(){}\n" +
            "    };",
            options: [2, {VariableDeclarator: 2, SwitchCase: 1}],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code:
            "var a = 1,\n" +
            "    B = \n" +
            "    class {\n" +
            "      constructor(){}\n" +
            "      a(){}\n" +
            "      get b(){}\n" +
            "    },\n" +
            "    c = 3;",
            options: [2, {VariableDeclarator: 2, SwitchCase: 1}],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code:
            "class A{\n" +
            "    constructor(){}\n" +
            "    a(){}\n" +
            "    get b(){}\n" +
            "}",
            options: [4, {VariableDeclarator: 1, SwitchCase: 1}],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code:
            "var A = class {\n" +
            "    constructor(){}\n" +
            "    a(){}\n" +
            "    get b(){}\n" +
            "}",
            options: [4, {VariableDeclarator: 1, SwitchCase: 1}],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code:
            "var a = {\n" +
            "  some: 1\n" +
            "  , name: 2\n" +
            "};\n",
            options: [2]
        },
        {
            code:
            "a.c = {\n" +
            "    aa: function() {\n" +
            "        'test1';\n" +
            "        return 'aa';\n" +
            "    }\n" +
            "    , bb: function() {\n" +
            "        return this.bb();\n" +
            "    }\n" +
            "};\n",
            options: [4]
        },
        {
            code:
            "var a =\n" +
            "{\n" +
            "    actions:\n" +
            "    [\n" +
            "        {\n" +
            "            name: 'compile'\n" +
            "        }\n" +
            "    ]\n" +
            "};\n",
            options: [4, {VariableDeclarator: 0, SwitchCase: 1}]
        },
        {
            code:
            "var a =\n" +
            "[\n" +
            "    {\n" +
            "        name: 'compile'\n" +
            "    }\n" +
            "];\n",
            options: [4, {VariableDeclarator: 0, SwitchCase: 1}]
        },
        {
            code:
            "const func = function (opts) {\n" +
            "    return Promise.resolve()\n" +
            "    .then(() => {\n" +
            "        [\n" +
            "            'ONE', 'TWO'\n" +
            "        ].forEach(command => { doSomething(); });\n" +
            "    });\n" +
            "};",
            parserOptions: { ecmaVersion: 6 },
            options: [4, {MemberExpression: 0}]
        },
        {
            code:
            "const func = function (opts) {\n" +
            "    return Promise.resolve()\n" +
            "        .then(() => {\n" +
            "            [\n" +
            "                'ONE', 'TWO'\n" +
            "            ].forEach(command => { doSomething(); });\n" +
            "        });\n" +
            "};",
            parserOptions: { ecmaVersion: 6 },
            options: [4]
        },
        {
            code:
            "var haveFun = function () {\n" +
            "    SillyFunction(\n" +
            "        {\n" +
            "            value: true,\n" +
            "        },\n" +
            "        {\n" +
            "            _id: true,\n" +
            "        }\n" +
            "    );\n" +
            "};",
            options: [4]
        },
        {
            code:
            "var haveFun = function () {\n" +
            "    new SillyFunction(\n" +
            "        {\n" +
            "            value: true,\n" +
            "        },\n" +
            "        {\n" +
            "            _id: true,\n" +
            "        }\n" +
            "    );\n" +
            "};",
            options: [4]
        },
        {
            code:
            "let object1 = {\n" +
            "  doThing() {\n" +
            "    return _.chain([])\n" +
            "      .map(v => (\n" +
            "        {\n" +
            "          value: true,\n" +
            "        }\n" +
            "      ))\n" +
            "      .value();\n" +
            "  }\n" +
            "};",
            parserOptions: { ecmaVersion: 6 },
            options: [2]
        },
        {
            code:
            "var foo = {\n" +
            "    bar: 1,\n" +
            "    baz: {\n" +
            "      qux: 2\n" +
            "    }\n" +
            "  },\n" +
            "  bar = 1;",
            options: [2]
        },
        {
            code:
            "class Foo\n" +
            "  extends Bar {\n" +
            "  baz() {}\n" +
            "}",
            parserOptions: { ecmaVersion: 6 },
            options: [2]
        },
        {
            code:
            "class Foo extends\n" +
            "  Bar {\n" +
            "  baz() {}\n" +
            "}",
            parserOptions: { ecmaVersion: 6 },
            options: [2]
        },
        {
            code:
            "fs.readdirSync(path.join(__dirname, '../rules')).forEach(name => {\n" +
            "  files[name] = foo;\n" +
            "});",
            options: [2, { outerIIFEBody: 0 }],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code:
            "(function(){\n" +
            "function foo(x) {\n" +
            "  return x + 1;\n" +
            "}\n" +
            "})();",
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code:
            "(function(){\n" +
            "        function foo(x) {\n" +
            "            return x + 1;\n" +
            "        }\n" +
            "})();",
            options: [4, { outerIIFEBody: 2 }]
        },
        {
            code:
            "(function(x, y){\n" +
            "function foo(x) {\n" +
            "  return x + 1;\n" +
            "}\n" +
            "})(1, 2);",
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code:
            "(function(){\n" +
            "function foo(x) {\n" +
            "  return x + 1;\n" +
            "}\n" +
            "}());",
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code:
            "!function(){\n" +
            "function foo(x) {\n" +
            "  return x + 1;\n" +
            "}\n" +
            "}();",
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code:
            "!function(){\n" +
            "\t\t\tfunction foo(x) {\n" +
            "\t\t\t\treturn x + 1;\n" +
            "\t\t\t}\n" +
            "}();",
            options: ["tab", { outerIIFEBody: 3 }]
        },
        {
            code:
            "var out = function(){\n" +
            "  function fooVar(x) {\n" +
            "    return x + 1;\n" +
            "  }\n" +
            "};",
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code:
            "var ns = function(){\n" +
            "function fooVar(x) {\n" +
            "  return x + 1;\n" +
            "}\n" +
            "}();",
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code:
            "ns = function(){\n" +
            "function fooVar(x) {\n" +
            "  return x + 1;\n" +
            "}\n" +
            "}();",
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code:
            "var ns = (function(){\n" +
            "function fooVar(x) {\n" +
            "  return x + 1;\n" +
            "}\n" +
            "}(x));",
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code:
            "var ns = (function(){\n" +
            "        function fooVar(x) {\n" +
            "            return x + 1;\n" +
            "        }\n" +
            "}(x));",
            options: [4, { outerIIFEBody: 2 }]
        },
        {
            code:
            "var obj = {\n" +
            "  foo: function() {\n" +
            "    return true;\n" +
            "  }\n" +
            "};",
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code:
            "while (\n" +
            "  function() {\n" +
            "    return true;\n" +
            "  }()) {\n" +
            "\n" +
            "  x = x + 1;\n" +
            "};",
            options: [2, { outerIIFEBody: 20 }]
        },
        {
            code:
            "(() => {\n" +
            "function foo(x) {\n" +
            "  return x + 1;\n" +
            "}\n" +
            "})();",
            parserOptions: { ecmaVersion: 6 },
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code:
            "function foo() {\n" +
            "}",
            options: ["tab", { outerIIFEBody: 0 }]
        },
        {
            code:
            ";(() => {\n" +
            "function foo(x) {\n" +
            "  return x + 1;\n" +
            "}\n" +
            "})();",
            parserOptions: { ecmaVersion: 6 },
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code:
            "if(data) {\n" +
            "  console.log('hi');\n" +
            "}",
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code:
            "Buffer.length",
            options: [4, { MemberExpression: 1 }]
        },
        {
            code:
            "Buffer\n" +
            "    .indexOf('a')\n" +
            "    .toString()",
            options: [4, { MemberExpression: 1 }]
        },
        {
            code:
            "Buffer.\n" +
            "    length",
            options: [4, { MemberExpression: 1 }]
        },
        {
            code:
            "Buffer\n" +
            "    .foo\n" +
            "    .bar",
            options: [4, { MemberExpression: 1 }]
        },
        {
            code:
            "Buffer\n" +
            "\t.foo\n" +
            "\t.bar",
            options: ["tab", { MemberExpression: 1 }]
        },
        {
            code:
            "Buffer\n" +
            "    .foo\n" +
            "    .bar",
            options: [2, {MemberExpression: 2}]
        },
        {
            code:
            "MemberExpression\n" +
            ".is" +
            "  .off" +
            "    .by" +
            " .default();",
            options: [4]
        },
        {
            code:
            "foo = bar.baz()\n" +
            "    .bip();",
            options: [4, {MemberExpression: 1}]
        },
        {
            code:
            "if (foo) {\n" +
            "  bar();\n" +
            "} else if (baz) {\n" +
            "  foobar();\n" +
            "} else if (qux) {\n" +
            "  qux();\n" +
            "}",
            options: [2]
        },
        {
            code:
            "function foo(aaa,\n" +
            "  bbb, ccc, ddd) {\n" +
            "    bar();\n" +
            "}",
            options: [2, {FunctionDeclaration: {parameters: 1, body: 2}}]
        },
        {
            code:
            "function foo(aaa, bbb,\n" +
            "      ccc, ddd) {\n" +
            "  bar();\n" +
            "}",
            options: [2, {FunctionDeclaration: {parameters: 3, body: 1}}]
        },
        {
            code:
            "function foo(aaa,\n" +
            "    bbb,\n" +
            "    ccc) {\n" +
            "            bar();\n" +
            "}",
            options: [4, {FunctionDeclaration: {parameters: 1, body: 3}}]
        },
        {
            code:
            "function foo(aaa,\n" +
            "             bbb, ccc,\n" +
            "             ddd, eee, fff) {\n" +
            "  bar();\n" +
            "}",
            options: [2, {FunctionDeclaration: {parameters: "first", body: 1}}]
        },
        {
            code:
            "function foo(aaa, bbb)\n" +
            "{\n" +
            "      bar();\n" +
            "}",
            options: [2, {FunctionDeclaration: {body: 3}}]
        },
        {
            code:
            "function foo(\n" +
            "  aaa,\n" +
            "  bbb) {\n" +
            "    bar();\n" +
            "}",
            options: [2, {FunctionDeclaration: {parameters: "first", body: 2}}]
        },
        {
            code:
            "var foo = function(aaa,\n" +
            "    bbb,\n" +
            "    ccc,\n" +
            "    ddd) {\n" +
            "bar();\n" +
            "}",
            options: [2, {FunctionExpression: {parameters: 2, body: 0}}]
        },
        {
            code:
            "var foo = function(aaa,\n" +
            "  bbb,\n" +
            "  ccc) {\n" +
            "                    bar();\n" +
            "}",
            options: [2, {FunctionExpression: {parameters: 1, body: 10}}]
        },
        {
            code:
            "var foo = function(aaa,\n" +
            "                   bbb, ccc, ddd,\n" +
            "                   eee, fff) {\n" +
            "    bar();\n" +
            "}",
            options: [4, {FunctionExpression: {parameters: "first", body: 1}}]
        },
        {
            code:
            "var foo = function(\n" +
            "  aaa, bbb, ccc,\n" +
            "  ddd, eee) {\n" +
            "      bar();\n" +
            "}",
            options: [2, {FunctionExpression: {parameters: "first", body: 3}}]
        },
        {
            code:
            "function foo() {\n" +
            "  bar();\n" +
            "  \tbaz();\n" +
            "\t   \t\t\t  \t\t\t  \t   \tqux();\n" +
            "}",
            options: [2]
        },
        {
            code:
            "function foo() {\n" +
            "  function bar() {\n" +
            "    baz();\n" +
            "  }\n" +
            "}",
            options: [2, {FunctionDeclaration: {body: 1}}]
        },
        {
            code:
            "function foo() {\n" +
            "  bar();\n" +
            "   \t\t}",
            options: [2]
        },
        {
            code:
            "function foo() {\n" +
            "  function bar(baz,\n" +
            "      qux) {\n" +
            "    foobar();\n" +
            "  }\n" +
            "}",
            options: [2, {FunctionDeclaration: {body: 1, parameters: 2}}]
        },
        {
            code:
            "((\n" +
            "    foo\n" +
            "))",
            options: [4]
        },
        {
            code:
            "foo\n" +
            "  ? bar\n" +
            "  : baz",
            options: [2]
        },
        {
            code:
            "foo = (bar ?\n" +
            "  baz :\n" +
            "  qux\n" +
            ");",
            options: [2]
        },
        {

            // Checking comments:
            // https://github.com/eslint/eslint/issues/6571
            code:
            "foo();\n" +
            "// Line\n" +
            "/* multiline\n" +
            "  Line */\n" +
            "bar();\n" +
            "// trailing comment",
            options: [2]
        },
        {
            code:
            "switch (foo) {\n" +
            "  case bar:\n" +
            "    baz();\n" +
            "    // call the baz function\n" +
            "}",
            options: [2, {SwitchCase: 1}]
        },
        {
            code:
            "switch (foo) {\n" +
            "  case bar:\n" +
            "    baz();\n" +
            "  // no default\n" +
            "}",
            options: [2, {SwitchCase: 1}]
        },
        {
            code:
            "[\n" +
            "    // no elements\n" +
            "]"
        },
        {

            // Destructuring assignments:
            // https://github.com/eslint/eslint/issues/6813
            code:
            "var {\n" +
            "  foo,\n" +
            "  bar,\n" +
            "  baz: qux,\n" +
            "  foobar: baz = foobar\n" +
            "} = qux;",
            options: [2],
            parserOptions: {ecmaVersion: 6}
        },
        {
            code:
            "var [\n" +
            "  foo,\n" +
            "  bar,\n" +
            "  baz,\n" +
            "  foobar = baz\n" +
            "] = qux;",
            options: [2],
            parserOptions: {ecmaVersion: 6}
        },
        {

            // https://github.com/eslint/eslint/issues/7233
            code:
            "var folder = filePath\n" +
            "    .foo()\n" +
            "    .bar;",
            options: [2, {MemberExpression: 2}]
        },
        {
            code:
            "for (const foo of bar)\n" +
            "  baz();",
            options: [2],
            parserOptions: {ecmaVersion: 6},
        },
        {
            code:
            "var x = () =>\n" +
            "  5;",
            options: [2],
            parserOptions: {ecmaVersion: 6}
        },
        {

            // Don't lint the indentation of the first token after a :
            code:
            "({code:\n" +
            "  \"foo.bar();\"})",
            options: [2]
        },
        {

            // Don't lint the indentation of the first token after a :
            code:
            "({code:\n" +
            "\"foo.bar();\"})",
            options: [2]
        },
        {

            // Comments in switch cases
            code:
            "switch (foo) {\n" +
            "  // comment\n" +
            "  case study:\n" +
            "    // comment\n" +
            "    bar();\n" +
            "  case closed:\n" +
            "    /* multiline comment\n" +
            "    */\n" +
            "}",
            options: [2, {SwitchCase: 1}]
        },
        {

            // Comments in switch cases
            code:
            "switch (foo) {\n" +
            "  // comment\n" +
            "  case study:\n" +
            "  // the comment can also be here\n" +
            "  case closed:\n" +
            "}",
            options: [2, {SwitchCase: 1}]
        },
        {

            // BinaryExpressions with parens
            code:
            "foo && (\n" +
            "    bar\n" +
            ")",
            options: [4]
        },
        {

            // BinaryExpressions with parens
            code:
            "foo && ((\n" +
            "    bar\n" +
            "))",
            options: [4]
        },
        {
            code:
            "foo &&\n" +
            "    (\n" +
            "        bar\n" +
            "    )",
            options: [4]
        },
        {
            code:
            "foo =\n" +
            "    bar;",
            options: [4]
        },
        {
            code:
            "function foo() {\n" +
            "  var bar = function(baz,\n" +
            "        qux) {\n" +
            "    foobar();\n" +
            "  };\n" +
            "}",
            options: [2, {FunctionExpression: {parameters: 3}}]
        },
        {
            code:
            "function foo() {\n" +
            "    return (foo === bar || (\n" +
            "        baz === qux && (\n" +
            "            foo === foo ||\n" +
            "            bar === bar ||\n" +
            "            baz === baz\n" +
            "        )\n" +
            "    ))" +
            "}",
            options: [4]
        },
        {
            code:
            "foo =\n" +
            "  (bar + baz);",
            options: [2]
        },
        {
            code:
            "/* comment */ if (foo) {\n" +
            "  bar();\n" +
            "}",
            options: [2]
        },
        {

            // Comments at the end of if blocks that have `else` blocks can either refer to the lines above or below them
            code:
            "if (foo) {\n" +
            "  bar();\n" +
            "// Otherwise, if foo is false, do baz.\n" +
            "// baz is very important.\n" +
            "} else {\n" +
            "  baz();\n" +
            "}",
            options: [2]
        },
        {
            code:
            "if (foo)\n" +
            "  bar();\n" +
            "// Otherwise, if foo is false, do baz.\n" +
            "// baz is very important.\n" +
            "else {\n" +
            "  baz();\n" +
            "}",
            options: [2]
        },
        {
            code:
            "if (\n" +
            "    foo && bar ||\n" +
            "    baz && qux\n" + // This line is ignored because BinaryExpressions are not checked.
            ") {\n" +
            "    qux();\n" +
            "}",
            options: [4]
        },
        {
            code:
            "var foo =\n" +
            "        1;",
            options: [4, {VariableDeclarator: 2}]
        },
        {
            code:
            "var foo = 1,\n" +
            "    bar =\n" +
            "    2;",
            options: [4]
        },
        {
            code:
            "switch (foo) {\n" +
            "  case bar:\n" +
            "  {\n" +
            "    baz();\n" +
            "  }\n" +
            "}",
            options: [2, {SwitchCase: 1}]
        },

        // Template curlies
        {
            code:
            "`foo${\n" +
            "  bar}`",
            options: [2],
            parserOptions: {ecmaVersion: 6}
        },
        {
            code:
            "`foo${\n" +
            "  `bar${\n" +
            "    baz}`}`",
            options: [2],
            parserOptions: {ecmaVersion: 6}
        },
        {
            code:
            "`foo${\n" +
            "  `bar${\n" +
            "    baz\n" +
            "  }`\n" +
            "}`",
            options: [2],
            parserOptions: {ecmaVersion: 6}
        },
        {
            code:
            "`foo${\n" +
            "  (\n" +
            "    bar\n" +
            "  )\n" +
            "}`",
            options: [2],
            parserOptions: {ecmaVersion: 6}
        },
        {

            // https://github.com/eslint/eslint/issues/7320
            code:
            "JSON\n" +
            "    .stringify(\n" +
            "        {\n" +
            "            ok: true\n" +
            "        }\n" +
            "    );\n"
        },

        // Don't check AssignmentExpression assignments
        {
            code:
            "foo =\n" +
            "    bar =\n" +
            "    baz;"
        },
        {
            code:
            "foo =\n" +
            "bar =\n" +
            "    baz;"
        },
        {
            code:
            "function foo() {\n" +
            "    const template = `this indentation is not checked\n" +
            "because it's part of a template literal.`;\n" +
            "}",
            parserOptions: {ecmaVersion: 6}
        },
        {
            code:
            "function foo() {\n" +
            "    const template = `the indentation of\n" +
            "a curly element in a ${\n" +
            "    node.type\n" +
            "} node is checked.`;" +
            "}"
        }
    ],
    invalid: [
        {
            code:
                "var a = b;\n" +
                "if (a) {\n" +
                "b();\n" +
                "}\n",
            options: [2],
            errors: expectedErrors([[3, 2, 0, "Identifier"]]),
            output:
                "var a = b;\n" +
                "if (a) {\n" +
                "  b();\n" +
                "}\n"
        },
        {
            code:
                "if (array.some(function(){\n" +
                "  return true;\n" +
                "})) {\n" +
                "a++; // ->\n" +
                "  b++;\n" +
                "    c++; // <-\n" +
                "}\n",
            output:
                "if (array.some(function(){\n" +
                "  return true;\n" +
                "})) {\n" +
                "  a++; // ->\n" +
                "  b++;\n" +
                "  c++; // <-\n" +
                "}\n",
            options: [2],
            errors: expectedErrors([[4, 2, 0, "Identifier"], [6, 2, 4, "Identifier"]])
        },
        {
            code: "if (a){\n\tb=c;\n\t\tc=d;\ne=f;\n}",
            output: "if (a){\n\tb=c;\n\tc=d;\n\te=f;\n}",
            options: ["tab"],
            errors: expectedErrors("tab", [[3, 1, 2, "Identifier"], [4, 1, 0, "Identifier"]])
        },
        {
            code: "if (a){\n    b=c;\n      c=d;\n e=f;\n}",
            output: "if (a){\n    b=c;\n    c=d;\n    e=f;\n}",
            options: [4],
            errors: expectedErrors([[3, 4, 6, "Identifier"], [4, 4, 1, "Identifier"]])
        },
        {
            code: fixture,
            output: fixedFixture,
            options: [2, {SwitchCase: 1, MemberExpression: 1}],
            errors: expectedErrors([
                [5, 2, 4, "Keyword"],
                [6, 2, 0, "Line"],
                [10, 4, 6, "Punctuator"],
                [11, 2, 4, "Punctuator"],

                [15, 4, 2, "Identifier"],
                [16, 2, 4, "Punctuator"],
                [23, 2, 4, "Punctuator"],
                [29, 2, 4, "Keyword"],
                [30, 4, 6, "Identifier"],
                [36, 4, 6, "Identifier"],
                [38, 2, 4, "Punctuator"],
                [39, 4, 2, "Identifier"],
                [40, 2, 0, "Punctuator"],
                [54, 2, 4, "Punctuator"],
                [114, 4, 2, "Keyword"],
                [120, 4, 6, "Keyword"],
                [124, 4, 2, "Keyword"],
                [134, 4, 6, "Keyword"],
                [138, 2, 3, "Punctuator"],
                [139, 2, 3, "Punctuator"],
                [143, 4, 0, "Identifier"],
                [144, 6, 2, "Punctuator"],
                [145, 6, 2, "Punctuator"],
                [151, 4, 6, "Identifier"],
                [152, 6, 8, "Punctuator"],
                [153, 6, 8, "Punctuator"],
                [159, 4, 2, "Identifier"],
                [161, 4, 6, "Identifier"],
                [175, 2, 0, "Identifier"],
                [177, 2, 4, "Identifier"],
                [189, 2, 0, "Keyword"],
                [193, 6, 4, "Identifier"],
                [195, 6, 8, "Identifier"],
                [228, 5, 4, "Identifier"],
                [231, 3, 2, "Punctuator"],
                [245, 0, 2, "Punctuator"],
                [248, 0, 2, "Punctuator"],
                [304, 4, 6, "Identifier"],
                [306, 4, 8, "Identifier"],
                [307, 2, 4, "Punctuator"],
                [308, 2, 4, "Identifier"],
                [311, 4, 6, "Identifier"],
                [312, 4, 6, "Identifier"],
                [313, 4, 6, "Identifier"],
                [314, 2, 4, "Punctuator"],
                [315, 2, 4, "Identifier"],
                [318, 4, 6, "Identifier"],
                [319, 4, 6, "Identifier"],
                [320, 4, 6, "Identifier"],
                [321, 2, 4, "Punctuator"],
                [322, 2, 4, "Identifier"],
                [326, 2, 1, "Numeric"],
                [327, 2, 1, "Numeric"],
                [328, 2, 1, "Numeric"],
                [329, 2, 1, "Numeric"],
                [330, 2, 1, "Numeric"],
                [331, 2, 1, "Numeric"],
                [332, 2, 1, "Numeric"],
                [333, 2, 1, "Numeric"],
                [334, 2, 1, "Numeric"],
                [335, 2, 1, "Numeric"],
                [340, 2, 4, "Identifier"],
                [341, 2, 0, "Identifier"],
                [344, 2, 4, "Identifier"],
                [345, 2, 0, "Identifier"],
                [348, 2, 4, "Identifier"],
                [349, 2, 0, "Identifier"],
                [355, 2, 0, "Identifier"],
                [357, 2, 4, "Identifier"],
                [361, 4, 6, "Identifier"],
                [362, 2, 4, "Punctuator"],
                [363, 2, 4, "Identifier"],
                [368, 2, 0, "Keyword"],
                [370, 2, 4, "Keyword"],
                [374, 4, 6, "Keyword"],
                [376, 4, 2, "Keyword"],
                [383, 2, 0, "Identifier"],
                [385, 2, 4, "Identifier"],
                [390, 2, 0, "Identifier"],
                [392, 2, 4, "Identifier"],
                [409, 2, 0, "Identifier"],
                [410, 2, 4, "Identifier"],
                [415, 6, 2, "Identifier"],
                [416, 6, 0, "Identifier"],
                [417, 6, 4, "Identifier"],
                [418, 4, 0, "Punctuator"],
                [422, 2, 4, "Identifier"],
                [423, 2, 0, "Identifier"],
                [427, 2, 6, "Identifier"],
                [428, 2, 8, "Identifier"],
                [429, 2, 4, "Identifier"],
                [430, 0, 4, "Punctuator"],
                [433, 2, 4, "Identifier"],
                [434, 0, 4, "Punctuator"],
                [437, 2, 0, "Identifier"],
                [438, 0, 4, "Punctuator"],
                [442, 4, 2, "Identifier"],
                [443, 4, 2, "Identifier"],
                [444, 2, 0, "Punctuator"],
                [451, 2, 0, "Identifier"],
                [453, 2, 4, "Identifier"],
                [499, 6, 8, "Punctuator"],
                [500, 8, 6, "Identifier"],
                [504, 4, 6, "Punctuator"],
                [505, 6, 8, "Identifier"],
                [506, 4, 8, "Punctuator"]
            ])
        },
        {
            code:
                "switch(value){\n" +
                "    case \"1\":\n" +
                "        a();\n" +
                "    break;\n" +
                "    case \"2\":\n" +
                "        a();\n" +
                "    break;\n" +
                "    default:\n" +
                "        a();\n" +
                "        break;\n" +
                "}",
            output:
                "switch(value){\n" +
                "    case \"1\":\n" +
                "        a();\n" +
                "        break;\n" +
                "    case \"2\":\n" +
                "        a();\n" +
                "        break;\n" +
                "    default:\n" +
                "        a();\n" +
                "        break;\n" +
                "}",
            options: [4, {SwitchCase: 1}],
            errors: expectedErrors([[4, 8, 4, "Keyword"], [7, 8, 4, "Keyword"]])
        },
        {
            code:
            "var x = 0 &&\n" +
            "    {\n" +
            "       a: 1,\n" +
            "          b: 2\n" +
            "    };",
            output:
            "var x = 0 &&\n" +
            "    {\n" +
            "        a: 1,\n" +
            "        b: 2\n" +
            "    };",
            options: [4],
            errors: expectedErrors([[3, 8, 7, "Identifier"], [4, 8, 10, "Identifier"]])
        },
        {
            code:
                "switch(value){\n" +
                "    case \"1\":\n" +
                "        a();\n" +
                "        break;\n" +
                "    case \"2\":\n" +
                "        a();\n" +
                "        break;\n" +
                "    default:\n" +
                "    break;\n" +
                "}",
            output:
                "switch(value){\n" +
                "    case \"1\":\n" +
                "        a();\n" +
                "        break;\n" +
                "    case \"2\":\n" +
                "        a();\n" +
                "        break;\n" +
                "    default:\n" +
                "        break;\n" +
                "}",
            options: [4, {SwitchCase: 1}],
            errors: expectedErrors([9, 8, 4, "Keyword"])
        },
        {
            code:
                "switch(value){\n" +
                "    case \"1\":\n" +
                "    case \"2\":\n" +
                "        a();\n" +
                "        break;\n" +
                "    default:\n" +
                "        break;\n" +
                "}\n" +
                "switch(value){\n" +
                "    case \"1\":\n" +
                "    break;\n" +
                "    case \"2\":\n" +
                "        a();\n" +
                "    break;\n" +
                "    default:\n" +
                "        a();\n" +
                "    break;\n" +
                "}",
            output:
                "switch(value){\n" +
                "    case \"1\":\n" +
                "    case \"2\":\n" +
                "        a();\n" +
                "        break;\n" +
                "    default:\n" +
                "        break;\n" +
                "}\n" +
                "switch(value){\n" +
                "    case \"1\":\n" +
                "        break;\n" +
                "    case \"2\":\n" +
                "        a();\n" +
                "        break;\n" +
                "    default:\n" +
                "        a();\n" +
                "        break;\n" +
                "}",
            options: [4, {SwitchCase: 1}],
            errors: expectedErrors([[11, 8, 4, "Keyword"], [14, 8, 4, "Keyword"], [17, 8, 4, "Keyword"]])
        },
        {
            code:
                "switch(value){\n" +
                "case \"1\":\n" +
                "        a();\n" +
                "        break;\n" +
                "    case \"2\":\n" +
                "        break;\n" +
                "    default:\n" +
                "        break;\n" +
                "}",
            output:
                "switch(value){\n" +
                "case \"1\":\n" +
                "    a();\n" +
                "    break;\n" +
                "case \"2\":\n" +
                "    break;\n" +
                "default:\n" +
                "    break;\n" +
                "}",
            options: [4],
            errors: expectedErrors([
                [3, 4, 8, "Identifier"],
                [4, 4, 8, "Keyword"],
                [5, 0, 4, "Keyword"],
                [6, 4, 8, "Keyword"],
                [7, 0, 4, "Keyword"],
                [8, 4, 8, "Keyword"]
            ])
        },
        {
            code:
                "var obj = {foo: 1, bar: 2};\n" +
                "with (obj) {\n" +
                "console.log(foo + bar);\n" +
                "}\n",
            output:
                "var obj = {foo: 1, bar: 2};\n" +
                "with (obj) {\n" +
                "    console.log(foo + bar);\n" +
                "}\n",
            errors: expectedErrors([3, 4, 0, "Identifier"])
        },
        {
            code:
                "switch (a) {\n" +
                "case '1':\n" +
                "b();\n" +
                "break;\n" +
                "default:\n" +
                "c();\n" +
                "break;\n" +
                "}\n",
            output:
                "switch (a) {\n" +
                "    case '1':\n" +
                "        b();\n" +
                "        break;\n" +
                "    default:\n" +
                "        c();\n" +
                "        break;\n" +
                "}\n",
            options: [4, {SwitchCase: 1}],
            errors: expectedErrors([
                [2, 4, 0, "Keyword"],
                [3, 8, 0, "Identifier"],
                [4, 8, 0, "Keyword"],
                [5, 4, 0, "Keyword"],
                [6, 8, 0, "Identifier"],
                [7, 8, 0, "Keyword"]
            ])
        },
        {
            code:
            "while (a) \n" +
            "b();",
            output:
            "while (a) \n" +
            "    b();",
            options: [4],
            errors: expectedErrors([
                [2, 4, 0, "Identifier"]
            ])
        },
        {
            code:
            "lmn = [{\n" +
            "        a: 1\n" +
            "    },\n" +
            "    {\n" +
            "        b: 2\n" +
            "    }," +
            "    {\n" +
            "        x: 2\n" +
            "}];",
            errors: expectedErrors([
                [2, 4, 8, "Identifier"],
                [3, 0, 4, "Punctuator"],
                [4, 0, 4, "Punctuator"],
                [5, 4, 8, "Identifier"],
                [6, 0, 4, "Punctuator"],
                [7, 0, 4, "Punctuator"],
                [8, 4, 8, "Identifier"]
            ])
        },
        {
            code:
            "for (var foo = 1;\n" +
            "foo < 10;\n" +
            "foo++) {}",
            output:
            "for (var foo = 1;\n" +
            "    foo < 10;\n" +
            "    foo++) {}",
            errors: expectedErrors([[2, 4, 0, "Identifier"], [3, 4, 0, "Identifier"]])
        },
        {
            code:
            "for (\n" +
            "var foo = 1;\n" +
            "foo < 10;\n" +
            "foo++\n" +
            "    ) {}",
            output:
            "for (\n" +
            "    var foo = 1;\n" +
            "    foo < 10;\n" +
            "    foo++\n" +
            ") {}",
            errors: expectedErrors([[1, 4, 0, "Keyword"], [2, 4, 0, "Identifier"], [3, 4, 0, "Identifier"], [4, 0, 4, "Punctuator"]])
        },
        {
            code:
            "for (;;) \n" +
            "b();",
            output:
            "for (;;) \n" +
            "    b();",
            options: [4],
            errors: expectedErrors([
                [2, 4, 0, "Identifier"]
            ])
        },
        {
            code:
            "for (a in x) \n" +
            "b();",
            output:
            "for (a in x) \n" +
            "    b();",
            options: [4],
            errors: expectedErrors([
                [2, 4, 0, "Identifier"]
            ])
        },
        {
            code:
            "do \n" +
            "b();\n" +
            "while(true)",
            output:
            "do \n" +
            "    b();\n" +
            "while(true)",
            options: [4],
            errors: expectedErrors([
                [2, 4, 0, "Identifier"]
            ])
        },
        {
            code:
            "if(true) \n" +
            "b();",
            output:
            "if(true) \n" +
            "    b();",
            options: [4],
            errors: expectedErrors([
                [2, 4, 0, "Identifier"]
            ])
        },
        {
            code:
            "var test = {\n" +
            "      a: 1,\n" +
            "    b: 2\n" +
            "    };\n",
            output:
            "var test = {\n" +
            "  a: 1,\n" +
            "  b: 2\n" +
            "};\n",
            options: [2],
            errors: expectedErrors([
                [2, 2, 6, "Identifier"],
                [3, 2, 4, "Identifier"],
                [4, 0, 4, "Punctuator"]
            ])
        },
        {
            code:
            "var a = function() {\n" +
            "      a++;\n" +
            "    b++;\n" +
            "          c++;\n" +
            "    },\n" +
            "    b;\n",
            output:
            "var a = function() {\n" +
            "        a++;\n" +
            "        b++;\n" +
            "        c++;\n" +
            "    },\n" +
            "    b;\n",
            options: [4],
            errors: expectedErrors([
                [2, 8, 6, "Identifier"],
                [3, 8, 4, "Identifier"],
                [4, 8, 10, "Identifier"]
            ])
        },
        {
            code:
            "var a = 1,\n" +
            "b = 2,\n" +
            "c = 3;\n",
            output:
            "var a = 1,\n" +
            "    b = 2,\n" +
            "    c = 3;\n",
            options: [4],
            errors: expectedErrors([
                [2, 4, 0, "Identifier"],
                [3, 4, 0, "Identifier"]
            ])
        },
        {
            code:
            "[a, b, \n" +
            "c].forEach((index) => {\n" +
            "  index;\n" +
            "});\n",
            output:
            "[a, b, \n" +
            "    c].forEach((index) => {\n" +
            "        index;\n" +
            "    });\n",
            options: [4],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([
                [2, 4, 0, "Identifier"],
                [3, 8, 2, "Identifier"],
                [4, 4, 0, "Punctuator"]
            ])
        },
        {
            code:
            "[a, b, \n" +
            "c].forEach(function(index){\n" +
            "  return index;\n" +
            "});\n",
            output:
            "[a, b, \n" +
            "    c].forEach(function(index){\n" +
            "        return index;\n" +
            "    });\n",
            options: [4],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([
                [2, 4, 0, "Identifier"],
                [3, 8, 2, "Keyword"],
                [4, 4, 0, "Punctuator"]
            ])
        },
        {
            code:
            "[a, b, c].forEach((index) => {\n" +
            "  index;\n" +
            "});\n",
            output:
            "[a, b, c].forEach((index) => {\n" +
            "    index;\n" +
            "});\n",
            options: [4],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([
                [2, 4, 2, "Identifier"]
            ])
        },
        {
            code:
            "[a, b, c].forEach(function(index){\n" +
            "  return index;\n" +
            "});\n",
            output:
            "[a, b, c].forEach(function(index){\n" +
            "    return index;\n" +
            "});\n",
            options: [4],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([
                [2, 4, 2, "Keyword"]
            ])
        },
        {
            code: "while (1 < 2)\nconsole.log('foo')\n  console.log('bar')",
            output: "while (1 < 2)\n  console.log('foo')\nconsole.log('bar')",
            options: [2],
            errors: expectedErrors([
                [2, 2, 0, "Identifier"],
                [3, 0, 2, "Identifier"]
            ])
        },
        {
            code:
            "function salutation () {\n" +
            "  switch (1) {\n" +
            "  case 0: return console.log('hi')\n" +
            "    case 1: return console.log('hey')\n" +
            "  }\n" +
            "}\n",
            output:
            "function salutation () {\n" +
            "  switch (1) {\n" +
            "    case 0: return console.log('hi')\n" +
            "    case 1: return console.log('hey')\n" +
            "  }\n" +
            "}\n",
            options: [2, { SwitchCase: 1 }],
            errors: expectedErrors([
                [3, 4, 2, "Keyword"]
            ])
        },
        {
            code:
            "var geometry, box, face1, face2, colorT, colorB, sprite, padding, maxWidth,\n" +
            "height, rotate;",
            output:
            "var geometry, box, face1, face2, colorT, colorB, sprite, padding, maxWidth,\n" +
            "  height, rotate;",
            options: [2, {SwitchCase: 1}],
            errors: expectedErrors([
                [2, 2, 0, "Identifier"]
            ])
        },
        {
            code:
            "switch (a) {\n" +
            "case '1':\n" +
            "b();\n" +
            "break;\n" +
            "default:\n" +
            "c();\n" +
            "break;\n" +
            "}\n",
            output:
            "switch (a) {\n" +
            "        case '1':\n" +
            "            b();\n" +
            "            break;\n" +
            "        default:\n" +
            "            c();\n" +
            "            break;\n" +
            "}\n",
            options: [4, {SwitchCase: 2}],
            errors: expectedErrors([
                [2, 8, 0, "Keyword"],
                [3, 12, 0, "Identifier"],
                [4, 12, 0, "Keyword"],
                [5, 8, 0, "Keyword"],
                [6, 12, 0, "Identifier"],
                [7, 12, 0, "Keyword"]
            ])
        },
        {
            code:
            "var geometry,\n" +
            "rotate;",
            output:
            "var geometry,\n" +
            "  rotate;",
            options: [2, {VariableDeclarator: 1}],
            errors: expectedErrors([
                [2, 2, 0, "Identifier"]
            ])
        },
        {
            code:
            "var geometry,\n" +
            "  rotate;",
            output:
            "var geometry,\n" +
            "    rotate;",
            options: [2, {VariableDeclarator: 2}],
            errors: expectedErrors([
                [2, 4, 2, "Identifier"]
            ])
        },
        {
            code:
            "var geometry,\n" +
            "\trotate;",
            output:
            "var geometry,\n" +
            "\t\trotate;",
            options: ["tab", {VariableDeclarator: 2}],
            errors: expectedErrors("tab", [
                [2, 2, 1, "Identifier"]
            ])
        },
        {
            code:
            "let geometry,\n" +
            "  rotate;",
            output:
            "let geometry,\n" +
            "    rotate;",
            options: [2, {VariableDeclarator: 2}],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([
                [2, 4, 2, "Identifier"]
            ])
        },
        {
            code:
            "if(true)\n" +
            "  if (true)\n" +
            "    if (true)\n" +
            "    console.log(val);",
            output:
            "if(true)\n" +
            "  if (true)\n" +
            "    if (true)\n" +
            "      console.log(val);",
            options: [2, {VariableDeclarator: 2, SwitchCase: 1}],
            errors: expectedErrors([
                [4, 6, 4, "Identifier"]
            ])
        },
        {
            code:
            "var a = {\n" +
            "    a: 1,\n" +
            "    b: 2\n" +
            "}",
            output:
            "var a = {\n" +
            "  a: 1,\n" +
            "  b: 2\n" +
            "}",
            options: [2, {VariableDeclarator: 2, SwitchCase: 1}],
            errors: expectedErrors([
                [2, 2, 4, "Identifier"],
                [3, 2, 4, "Identifier"]
            ])
        },
        {
            code:
            "var a = [\n" +
            "    a,\n" +
            "    b\n" +
            "]",
            output:
            "var a = [\n" +
            "  a,\n" +
            "  b\n" +
            "]",
            options: [2, {VariableDeclarator: 2, SwitchCase: 1}],
            errors: expectedErrors([
                [2, 2, 4, "Identifier"],
                [3, 2, 4, "Identifier"]
            ])
        },
        {
            code:
            "let a = [\n" +
            "    a,\n" +
            "    b\n" +
            "]",
            output:
            "let a = [\n" +
            "  a,\n" +
            "  b\n" +
            "]",
            options: [2, {VariableDeclarator: { let: 2 }, SwitchCase: 1}],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([
                [2, 2, 4, "Identifier"],
                [3, 2, 4, "Identifier"]
            ])
        },
        {
            code:
            "var a = new Test({\n" +
            "      a: 1\n" +
            "  }),\n" +
            "    b = 4;\n",
            output:
            "var a = new Test({\n" +
            "        a: 1\n" +
            "    }),\n" +
            "    b = 4;\n",
            options: [4],
            errors: expectedErrors([
                [2, 8, 6, "Identifier"],
                [3, 4, 2, "Punctuator"]
            ])
        },
        {
            code:
            "var a = new Test({\n" +
            "      a: 1\n" +
            "    }),\n" +
            "    b = 4;\n" +
            "const a = new Test({\n" +
            "      a: 1\n" +
            "    }),\n" +
            "    b = 4;\n",
            output:
            "var a = new Test({\n" +
            "      a: 1\n" +
            "    }),\n" +
            "    b = 4;\n" +
            "const a = new Test({\n" +
            "    a: 1\n" +
            "  }),\n" +
            "  b = 4;\n",
            options: [2, { VariableDeclarator: { var: 2 }}],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([
                [6, 4, 6, "Identifier"],
                [7, 2, 4, "Punctuator"],
                [8, 2, 4, "Identifier"]
            ])
        },
        {
            code:
            "var abc = 5,\n" +
            "    c = 2,\n" +
            "    xyz = \n" +
            "     {\n" +
            "       a: 1,\n" +
            "        b: 2\n" +
            "     };",
            output:
            "var abc = 5,\n" +
            "    c = 2,\n" +
            "    xyz = \n" +
            "    {\n" +
            "      a: 1,\n" +
            "      b: 2\n" +
            "    };",
            options: [2, {VariableDeclarator: 2, SwitchCase: 1}],
            errors: expectedErrors([
                [4, 4, 5, "Punctuator"],
                [5, 6, 7, "Identifier"],
                [6, 6, 8, "Identifier"],
                [7, 4, 5, "Punctuator"]
            ])
        },
        {
            code:
            "var abc = \n" +
            "     {\n" +
            "       a: 1,\n" +
            "        b: 2\n" +
            "     };",
            output:
            "var abc = \n" +
            "    {\n" +
            "      a: 1,\n" +
            "      b: 2\n" +
            "    };",
            options: [2, {VariableDeclarator: 2, SwitchCase: 1}],
            errors: expectedErrors([
                [2, 4, 5, "Punctuator"],
                [3, 6, 7, "Identifier"],
                [4, 6, 8, "Identifier"],
                [5, 4, 5, "Punctuator"]
            ])
        },
        {
            code:
            "var foo = {\n" +
            "    bar: 1,\n" +
            "    baz: {\n" +
            "        qux: 2\n" +
            "      }\n" +
            "  },\n" +
            "  bar = 1;",
            output:
            "var foo = {\n" +
            "    bar: 1,\n" +
            "    baz: {\n" +
            "      qux: 2\n" +
            "    }\n" +
            "  },\n" +
            "  bar = 1;",
            options: [2],
            errors: expectedErrors([[4, 6, 8, "Identifier"], [5, 4, 6, "Punctuator"]])
        },
        {
            code:
                "var path     = require('path')\n" +
                " , crypto    = require('crypto')\n" +
                ";\n",
            output:
                "var path     = require('path')\n" +
                "  , crypto    = require('crypto')\n" +
                "  ;\n",
            options: [2],
            errors: expectedErrors([
                [2, 2, 1, "Punctuator"],
                [3, 2, 0, "Punctuator"]
            ])
        },
        {
            code:
                "var a = 1\n" +
                "   ,b = 2\n" +
                ";",
            output:
                "var a = 1\n" +
                "    ,b = 2\n" +
                "    ;",
            errors: expectedErrors([
                [2, 4, 3, "Punctuator"],
                [3, 4, 0, "Punctuator"]
            ])
        },
        {
            code:
            "class A{\n" +
            "  constructor(){}\n" +
            "    a(){}\n" +
            "    get b(){}\n" +
            "}",
            output:
            "class A{\n" +
            "    constructor(){}\n" +
            "    a(){}\n" +
            "    get b(){}\n" +
            "}",
            options: [4, {VariableDeclarator: 1, SwitchCase: 1}],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([[2, 4, 2, "Identifier"]])
        },
        {
            code:
            "var A = class {\n" +
            "  constructor(){}\n" +
            "    a(){}\n" +
            "  get b(){}\n" +
            "};",
            output:
            "var A = class {\n" +
            "    constructor(){}\n" +
            "    a(){}\n" +
            "    get b(){}\n" +
            "};",
            options: [4, {VariableDeclarator: 1, SwitchCase: 1}],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([[2, 4, 2, "Identifier"], [4, 4, 2, "Identifier"]])
        },
        {
            code:
            "var a = 1,\n" +
            "    B = class {\n" +
            "    constructor(){}\n" +
            "      a(){}\n" +
            "      get b(){}\n" +
            "    };",
            output:
            "var a = 1,\n" +
            "    B = class {\n" +
            "      constructor(){}\n" +
            "      a(){}\n" +
            "      get b(){}\n" +
            "    };",
            options: [2, {VariableDeclarator: 2, SwitchCase: 1}],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([[3, 6, 4, "Identifier"]])
        },
        {
            code:
            "{\n" +
            "    if(a){\n" +
            "        foo();\n" +
            "    }\n" +
            "  else{\n" +
            "        bar();\n" +
            "    }\n" +
            "}\n",
            output:
            "{\n" +
            "    if(a){\n" +
            "        foo();\n" +
            "    }\n" +
            "    else{\n" +
            "        bar();\n" +
            "    }\n" +
            "}\n",
            options: [4],
            errors: expectedErrors([[5, 4, 2, "Keyword"]])
        },
        {
            code:
            "{\n" +
            "    if(a){\n" +
            "        foo();\n" +
            "    }\n" +
            "  else\n" +
            "        bar();\n" +
            "    \n" +
            "}\n",
            output:
            "{\n" +
            "    if(a){\n" +
            "        foo();\n" +
            "    }\n" +
            "    else\n" +
            "        bar();\n" +
            "    \n" +
            "}\n",
            options: [4],
            errors: expectedErrors([[5, 4, 2, "Keyword"]])
        },
        {
            code:
            "{\n" +
            "    if(a)\n" +
            "        foo();\n" +
            "  else\n" +
            "        bar();\n" +
            "}\n",
            output:
            "{\n" +
            "    if(a)\n" +
            "        foo();\n" +
            "    else\n" +
            "        bar();\n" +
            "}\n",
            options: [4],
            errors: expectedErrors([[4, 4, 2, "Keyword"]])
        },
        {
            code:
            "(function(){\n" +
            "  function foo(x) {\n" +
            "    return x + 1;\n" +
            "  }\n" +
            "})();",
            output:
            "(function(){\n" +
            "function foo(x) {\n" +
            "  return x + 1;\n" +
            "}\n" +
            "})();",
            options: [2, { outerIIFEBody: 0 }],
            errors: expectedErrors([[2, 0, 2, "Keyword"], [3, 2, 4, "Keyword"], [4, 0, 2, "Punctuator"]])
        },
        {
            code:
            "(function(){\n" +
            "    function foo(x) {\n" +
            "        return x + 1;\n" +
            "    }\n" +
            "})();",
            output:
            "(function(){\n" +
            "        function foo(x) {\n" +
            "            return x + 1;\n" +
            "        }\n" +
            "})();",
            options: [4, { outerIIFEBody: 2 }],
            errors: expectedErrors([[2, 8, 4, "Keyword"], [3, 12, 8, "Keyword"], [4, 8, 4, "Punctuator"]])
        },
        {
            code:
            "if(data) {\n" +
            "console.log('hi');\n" +
            "}",
            options: [2, { outerIIFEBody: 0 }],
            errors: expectedErrors([[2, 2, 0, "Identifier"]])
        },
        {
            code:
            "var ns = function(){\n" +
            "    function fooVar(x) {\n" +
            "        return x + 1;\n" +
            "    }\n" +
            "}(x);",
            output:
            "var ns = function(){\n" +
            "        function fooVar(x) {\n" +
            "            return x + 1;\n" +
            "        }\n" +
            "}(x);",
            options: [4, { outerIIFEBody: 2 }],
            errors: expectedErrors([[2, 8, 4, "Keyword"], [3, 12, 8, "Keyword"], [4, 8, 4, "Punctuator"]])
        },
        {
            code:
            "var obj = {\n" +
            "  foo: function() {\n" +
            "  return true;\n" +
            "  }()\n" +
            "};\n",
            options: [2, { outerIIFEBody: 0 }],
            errors: expectedErrors([[3, 4, 2, "Keyword"]])
        },
        {
            code:
            "typeof function() {\n" +
            "    function fooVar(x) {\n" +
            "      return x + 1;\n" +
            "    }\n" +
            "}();",
            output:
            "typeof function() {\n" +
            "  function fooVar(x) {\n" +
            "    return x + 1;\n" +
            "  }\n" +
            "}();",
            options: [2, { outerIIFEBody: 2 }],
            errors: expectedErrors([[2, 2, 4, "Keyword"], [3, 4, 6, "Keyword"], [4, 2, 4, "Punctuator"]])
        },
        {
            code:
            "{\n" +
            "\t!function(x) {\n" +
            "\t\t\t\treturn x + 1;\n" +
            "\t}()\n" +
            "};",
            output:
            "{\n" +
            "\t!function(x) {\n" +
            "\t\treturn x + 1;\n" +
            "\t}()\n" +
            "};",
            options: ["tab", { outerIIFEBody: 3 }],
            errors: expectedErrors("tab", [[3, 2, 4, "Keyword"]])
        },
        {
            code:
            "Buffer\n" +
            ".toString()",
            output:
            "Buffer\n" +
            "    .toString()",
            options: [4, { MemberExpression: 1 }],
            errors: expectedErrors([[2, 4, 0, "Punctuator"]])
        },
        {
            code:
            "Buffer\n" +
            "    .indexOf('a')\n" +
            ".toString()",
            output:
            "Buffer\n" +
            "    .indexOf('a')\n" +
            "    .toString()",
            options: [4, { MemberExpression: 1 }],
            errors: expectedErrors([[3, 4, 0, "Punctuator"]])
        },
        {
            code:
            "Buffer.\n" +
            "length",
            output:
            "Buffer.\n" +
            "    length",
            options: [4, { MemberExpression: 1 }],
            errors: expectedErrors([[2, 4, 0, "Identifier"]])
        },
        {
            code:
            "Buffer.\n" +
            "\t\tlength",
            output:
            "Buffer.\n" +
            "\tlength",
            options: ["tab", { MemberExpression: 1 }],
            errors: expectedErrors("tab", [[2, 1, 2, "Identifier"]])
        },
        {
            code:
            "Buffer\n" +
            "  .foo\n" +
            "  .bar",
            output:
            "Buffer\n" +
            "    .foo\n" +
            "    .bar",
            options: [2, { MemberExpression: 2 }],
            errors: expectedErrors([[2, 4, 2, "Punctuator"], [3, 4, 2, "Punctuator"]])
        },
        {

            // Indentation with multiple else statements: https://github.com/eslint/eslint/issues/6956

            code:
            "if (foo) bar();\n" +
            "else if (baz) foobar();\n" +
            "  else if (qux) qux();",
            output:
            "if (foo) bar();\n" +
            "else if (baz) foobar();\n" +
            "else if (qux) qux();",
            options: [2],
            errors: expectedErrors([3, 0, 2, "Keyword"])
        },
        {
            code:
            "if (foo) bar();\n" +
            "else if (baz) foobar();\n" +
            "  else qux();",
            output:
            "if (foo) bar();\n" +
            "else if (baz) foobar();\n" +
            "else qux();",
            options: [2],
            errors: expectedErrors([3, 0, 2, "Keyword"])
        },
        {
            code:
            "foo();\n" +
            "  if (baz) foobar();\n" +
            "  else qux();",
            output:
            "foo();\n" +
            "if (baz) foobar();\n" +
            "else qux();",
            options: [2],
            errors: expectedErrors([[2, 0, 2, "Keyword"], [3, 0, 2, "Keyword"]])
        },
        {
            code:
            "if (foo) bar();\n" +
            "else if (baz) foobar();\n" +
            "     else if (bip) {\n" +
            "       qux();\n" +
            "     }",
            output:
            "if (foo) bar();\n" +
            "else if (baz) foobar();\n" +
            "else if (bip) {\n" +
            "  qux();\n" +
            "}",
            options: [2],
            errors: expectedErrors([[3, 0, 5, "Keyword"], [4, 2, 7, "Identifier"], [5, 0, 5, "Punctuator"]])
        },
        {
            code:
            "if (foo) bar();\n" +
            "else if (baz) {\n" +
            "    foobar();\n" +
            "     } else if (boop) {\n" +
            "       qux();\n" +
            "     }",
            output:
            "if (foo) bar();\n" +
            "else if (baz) {\n" +
            "  foobar();\n" +
            "} else if (boop) {\n" +
            "  qux();\n" +
            "}",
            options: [2],
            errors: expectedErrors([[3, 2, 4, "Identifier"], [4, 0, 5, "Punctuator"], [5, 2, 7, "Identifier"], [6, 0, 5, "Punctuator"]])
        },
        {
            code:
            "function foo(aaa,\n" +
            "    bbb, ccc, ddd) {\n" +
            "      bar();\n" +
            "}",
            output:
            "function foo(aaa,\n" +
            "  bbb, ccc, ddd) {\n" +
            "    bar();\n" +
            "}",
            options: [2, {FunctionDeclaration: {parameters: 1, body: 2}}],
            errors: expectedErrors([[2, 2, 4, "Identifier"], [3, 4, 6, "Identifier"]])
        },
        {
            code:
            "function foo(aaa, bbb,\n" +
            "  ccc, ddd) {\n" +
            "bar();\n" +
            "}",
            output:
            "function foo(aaa, bbb,\n" +
            "      ccc, ddd) {\n" +
            "  bar();\n" +
            "}",
            options: [2, {FunctionDeclaration: {parameters: 3, body: 1}}],
            errors: expectedErrors([[2, 6, 2, "Identifier"], [3, 2, 0, "Identifier"]])
        },
        {
            code:
            "function foo(aaa,\n" +
            "        bbb,\n" +
            "  ccc) {\n" +
            "      bar();\n" +
            "}",
            output:
            "function foo(aaa,\n" +
            "    bbb,\n" +
            "    ccc) {\n" +
            "            bar();\n" +
            "}",
            options: [4, {FunctionDeclaration: {parameters: 1, body: 3}}],
            errors: expectedErrors([[2, 4, 8, "Identifier"], [3, 4, 2, "Identifier"], [4, 12, 6, "Identifier"]])
        },
        {
            code:
            "function foo(aaa,\n" +
            "  bbb, ccc,\n" +
            "                   ddd, eee, fff) {\n" +
            "   bar();\n" +
            "}",
            output:
            "function foo(aaa,\n" +
            "             bbb, ccc,\n" +
            "             ddd, eee, fff) {\n" +
            "  bar();\n" +
            "}",
            options: [2, {FunctionDeclaration: {parameters: "first", body: 1}}],
            errors: expectedErrors([[2, 13, 2, "Identifier"], [3, 13, 19, "Identifier"], [4, 2, 3, "Identifier"]])
        },
        {
            code:
            "function foo(aaa, bbb)\n" +
            "{\n" +
            "bar();\n" +
            "}",
            output:
            "function foo(aaa, bbb)\n" +
            "{\n" +
            "      bar();\n" +
            "}",
            options: [2, {FunctionDeclaration: {body: 3}}],
            errors: expectedErrors([3, 6, 0, "Identifier"])
        },
        {
            code:
            "function foo(\n" +
            "aaa,\n" +
            "    bbb) {\n" +
            "bar();\n" +
            "}",
            output:
            "function foo(\n" +
            "aaa,\n" +
            "bbb) {\n" +
            "    bar();\n" +
            "}",
            options: [2, {FunctionDeclaration: {parameters: "first", body: 2}}],
            errors: expectedErrors([[3, 0, 4, "Identifier"], [4, 4, 0, "Identifier"]])
        },
        {
            code:
            "var foo = function(aaa,\n" +
            "  bbb,\n" +
            "    ccc,\n" +
            "      ddd) {\n" +
            "  bar();\n" +
            "}",
            output:
            "var foo = function(aaa,\n" +
            "    bbb,\n" +
            "    ccc,\n" +
            "    ddd) {\n" +
            "bar();\n" +
            "}",
            options: [2, {FunctionExpression: {parameters: 2, body: 0}}],
            errors: expectedErrors([[2, 4, 2, "Identifier"], [4, 4, 6, "Identifier"], [5, 0, 2, "Identifier"]])
        },
        {
            code:
            "var foo = function(aaa,\n" +
            "   bbb,\n" +
            " ccc) {\n" +
            "  bar();\n" +
            "}",
            output:
            "var foo = function(aaa,\n" +
            "  bbb,\n" +
            "  ccc) {\n" +
            "                    bar();\n" +
            "}",
            options: [2, {FunctionExpression: {parameters: 1, body: 10}}],
            errors: expectedErrors([[2, 2, 3, "Identifier"], [3, 2, 1, "Identifier"], [4, 20, 2, "Identifier"]])
        },
        {
            code:
            "var foo = function(aaa,\n" +
            "  bbb, ccc, ddd,\n" +
            "                        eee, fff) {\n" +
            "        bar();\n" +
            "}",
            output:
            "var foo = function(aaa,\n" +
            "                   bbb, ccc, ddd,\n" +
            "                   eee, fff) {\n" +
            "    bar();\n" +
            "}",
            options: [4, {FunctionExpression: {parameters: "first", body: 1}}],
            errors: expectedErrors([[2, 19, 2, "Identifier"], [3, 19, 24, "Identifier"], [4, 4, 8, "Identifier"]])
        },
        {
            code:
            "var foo = function(\n" +
            "aaa, bbb, ccc,\n" +
            "    ddd, eee) {\n" +
            "  bar();\n" +
            "}",
            output:
            "var foo = function(\n" +
            "aaa, bbb, ccc,\n" +
            "ddd, eee) {\n" +
            "      bar();\n" +
            "}",
            options: [2, {FunctionExpression: {parameters: "first", body: 3}}],
            errors: expectedErrors([[3, 0, 4, "Identifier"], [4, 6, 2, "Identifier"]])
        },
        {
            code:
            "var foo = bar;\n" +
            "\t\t\tvar baz = qux;",
            output:
            "var foo = bar;\n" +
            "var baz = qux;",
            options: [2],
            errors: expectedErrors([2, "0 spaces", "3 tabs", "Keyword"])
        },
        {
            code:
            "function foo() {\n" +
            "\tbar();\n" +
            "  baz();\n" +
            "              qux();\n" +
            "}",
            output:
            "function foo() {\n" +
            "\tbar();\n" +
            "\tbaz();\n" +
            "\tqux();\n" +
            "}",
            options: ["tab"],
            errors: expectedErrors("tab", [[3, "1 tab", "2 spaces", "Identifier"], [4, "1 tab", "14 spaces", "Identifier"]])
        },
        {
            code:
            "function foo() {\n" +
            "  bar();\n" +
            "\t\t}",
            output:
            "function foo() {\n" +
            "  bar();\n" +
            "}",
            options: [2],
            errors: expectedErrors([[3, "0 spaces", "2 tabs", "Punctuator"]])
        },
        {
            code:
            "function foo() {\n" +
            "  function bar() {\n" +
            "        baz();\n" +
            "  }\n" +
            "}",
            output:
            "function foo() {\n" +
            "  function bar() {\n" +
            "    baz();\n" +
            "  }\n" +
            "}",
            options: [2, {FunctionDeclaration: {body: 1}}],
            errors: expectedErrors([3, 4, 8, "Identifier"])
        },
        {
            code:
            "function foo() {\n" +
            "  function bar(baz,\n" +
            "    qux) {\n" +
            "    foobar();\n" +
            "  }\n" +
            "}",
            output:
            "function foo() {\n" +
            "  function bar(baz,\n" +
            "      qux) {\n" +
            "    foobar();\n" +
            "  }\n" +
            "}",
            options: [2, {FunctionDeclaration: {body: 1, parameters: 2}}],
            errors: expectedErrors([3, 6, 4, "Identifier"])
        },
        {
            code:
            "function foo() {\n" +
            "  var bar = function(baz,\n" +
            "          qux) {\n" +
            "    foobar();\n" +
            "  };\n" +
            "}",
            output:
            "function foo() {\n" +
            "  var bar = function(baz,\n" +
            "        qux) {\n" +
            "    foobar();\n" +
            "  };\n" +
            "}",
            options: [2, {FunctionExpression: {parameters: 3}}],
            errors: expectedErrors([3, 8, 10, "Identifier"])
        },
        {
            code:
            "((\n" +
            "foo\n" +
            "))",
            output:
            "((\n" +
            "    foo\n" +
            "))",
            options: [4],
            errors: expectedErrors([2, 4, 0, "Identifier"])
        },
        {
            code:
            "foo\n" +
            "? bar\n" +
            "    : baz",
            output:
            "foo\n" +
            "  ? bar\n" +
            "  : baz",
            options: [2],
            errors: expectedErrors([[2, 2, 0, "Punctuator"], [3, 2, 4, "Punctuator"]])
        },
        {

            // Checking comments:
            // https://github.com/eslint/eslint/issues/6571
            code:
            "foo();\n" +
            "  // comment\n" +
            "    /* multiline\n" +
            "  comment */\n" +
            "bar();\n" +
            " // trailing comment",
            output:
            "foo();\n" +
            "// comment\n" +
            "/* multiline\n" +
            "  comment */\n" +
            "bar();\n" +
            "// trailing comment",
            options: [2],
            errors: expectedErrors([[2, 0, 2, "Line"], [3, 0, 4, "Block"], [6, 0, 1, "Line"]])
        },
        {
            code:
            "[\n" +
            "        // no elements\n" +
            "]",
            output:
            "[\n" +
            "    // no elements\n" +
            "]",
            errors: expectedErrors([2, 4, 8, "Line"])
        },
        {

            // Destructuring assignments:
            // https://github.com/eslint/eslint/issues/6813
            code:
            "var {\n" +
            "foo,\n" +
            "  bar,\n" +
            "    baz: qux,\n" +
            "      foobar: baz = foobar\n" +
            "  } = qux;",
            output:
            "var {\n" +
            "  foo,\n" +
            "  bar,\n" +
            "  baz: qux,\n" +
            "  foobar: baz = foobar\n" +
            "} = qux;",
            options: [2],
            parserOptions: {ecmaVersion: 6},
            errors: expectedErrors([[2, 2, 0, "Identifier"], [4, 2, 4, "Identifier"], [5, 2, 6, "Identifier"], [6, 0, 2, "Punctuator"]])
        },
        {
            code:
            "var [\n" +
            "foo,\n" +
            "  bar,\n" +
            "    baz,\n" +
            "      foobar = baz\n" +
            "  ] = qux;",
            output:
            "var [\n" +
            "  foo,\n" +
            "  bar,\n" +
            "  baz,\n" +
            "  foobar = baz\n" +
            "] = qux;",
            options: [2],
            parserOptions: {ecmaVersion: 6},
            errors: expectedErrors([[2, 2, 0, "Identifier"], [4, 2, 4, "Identifier"], [5, 2, 6, "Identifier"], [6, 0, 2, "Punctuator"]])
        },
        {

            // https://github.com/eslint/eslint/issues/7233
            code:
            "var folder = filePath\n" +
            "  .foo()\n" +
            "      .bar;",
            options: [2, {MemberExpression: 2}],
            errors: expectedErrors([[2, 4, 2, "Punctuator"], [3, 4, 6, "Punctuator"]])
        },
        {
            code:
            "for (const foo of bar)\n" +
            "    baz();",
            output:
            "for (const foo of bar)\n" +
            "  baz();",
            options: [2],
            parserOptions: {ecmaVersion: 6},
            errors: expectedErrors([2, 2, 4, "Identifier"])
        },
        {
            code:
            "var x = () =>\n" +
            "    5;",
            output:
            "var x = () =>\n" +
            "  5;",
            options: [2],
            parserOptions: {ecmaVersion: 6},
            errors: expectedErrors([2, 2, 4, "Numeric"])
        },
        {

            // BinaryExpressions with parens
            code:
            "foo && (\n" +
            "        bar\n" +
            ")",
            output:
            "foo && (\n" +
            "    bar\n" +
            ")",
            options: [4],
            errors: expectedErrors([2, 4, 8, "Identifier"])
        },
        {
            code:
            "var foo = 1,\n" +
            "    bar =\n" +
            "        2;",
            output:
            "var foo = 1,\n" +
            "    bar =\n" +
            "    2;",
            options: [4],
            errors: expectedErrors([3, 4, 8, "Numeric"])
        },
        {
            code:
            "var foo =\n" +
            "    1;",
            output:
            "var foo =\n" +
            "        1;",
            options: [4, {VariableDeclarator: 2}],
            errors: expectedErrors([2, 8, 4, "Numeric"])
        },

        // Template curlies
        {
            code:
            "`foo${\n" +
            "bar}`",
            output:
            "`foo${\n" +
            "  bar}`",
            options: [2],
            parserOptions: {ecmaVersion: 6},
            errors: expectedErrors([2, 2, 0, "Identifier"])
        },
        {
            code:
            "`foo${\n" +
            "    `bar${\n" +
            "baz}`}`",
            output:
            "`foo${\n" +
            "  `bar${\n" +
            "    baz}`}`",
            options: [2],
            parserOptions: {ecmaVersion: 6},
            errors: expectedErrors([[2, 2, 4, "Template"], [3, 4, 0, "Identifier"]])
        },
        {
            code:
            "`foo${\n" +
            "    `bar${\n" +
            "  baz\n" +
            "    }`\n" +
            "  }`",
            output:
            "`foo${\n" +
            "  `bar${\n" +
            "    baz\n" +
            "  }`\n" +
            "}`",
            options: [2],
            parserOptions: {ecmaVersion: 6},
            errors: expectedErrors([[2, 2, 4, "Template"], [3, 4, 2, "Identifier"], [4, 2, 4, "Template"], [5, 0, 2, "Template"]])
        },
        {
            code:
            "`foo${\n" +
            "(\n" +
            "  bar\n" +
            ")\n" +
            "}`",
            output:
            "`foo${\n" +
            "  (\n" +
            "    bar\n" +
            "  )\n" +
            "}`",
            options: [2],
            parserOptions: {ecmaVersion: 6},
            errors: expectedErrors([[2, 2, 0, "Punctuator"], [3, 4, 2, "Identifier"], [4, 2, 0, "Punctuator"]])
        },
        {
            code:
            "function foo() {\n" +
            "    const template = `the indentation of\n" +
            "a curly element in a ${\n" +
            "        node.type\n" +
            "    } node is checked.`;" +
            "}",
            output:
            "function foo() {\n" +
            "    const template = `the indentation of\n" +
            "a curly element in a ${\n" +
            "    node.type\n" +
            "} node is checked.`;" +
            "}",
            errors: expectedErrors([[4, 4, 8, "Identifier"], [5, 0, 4, "Punctuator"]]),
            parserOptions: {ecmaVersion: 6}
        },
        {
            code:
            "function foo() {\n" +
            "    const template = `this time the\n" +
            "closing curly is at the end of the line ${\n" +
            "        foo}\n" +
            "    so the spaces before this line aren't removed.`;" +
            "}",
            output:
            "function foo() {\n" +
            "    const template = `this time the\n" +
            "closing curly is at the end of the line ${\n" +
            "    foo}\n" +
            "    so the spaces before this line aren't removed.`;" +
            "}",
            errors: expectedErrors([5, 0, 4, "Identifier"]),
            parserOptions: {ecmaVersion: 6}
        }
    ]
});
