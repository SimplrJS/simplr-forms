import * as path from "path";
import * as childProcess from "child_process";

const packageJson = require("./package.json");

let externals: {
    [key: string]: any
} = {};

for (const key in packageJson.dependencies) {
    if (packageJson.dependencies.hasOwnProperty(key)) {
        externals[key] = key;
    }
}

const externalsResolver = [
    externals,
    function (context: string, request: string, callback: Function) {
        const directoriesToTest = [
            "abstractions",
            "subscribers",
            "utils"
        ];

        const tests = directoriesToTest.map(directory => ({
            regex: new RegExp(`.*/${directory}/.+$`),
            directory: directory
        }));

        let passingTest;
        for (const test of tests) {
            if (test.regex.test(request)) {
                passingTest = test;
            }
        }

        if (passingTest != null) {
            const resolvedPath = path.resolve(context, request);
            const shouldReplaceWithCustomResolve =
                request.indexOf("src") === -1 &&
                resolvedPath.indexOf(path.join(__dirname, `src/${passingTest.directory}`)) !== -1;

            if (shouldReplaceWithCustomResolve) {
                const customResolve = `./${passingTest.directory}`;
                callback(null, customResolve);
                return;
            }
        }
        callback();
    }
];

module.exports = {
    entry: {
        index: "./src/index.ts",
        abstractions: "./src/abstractions.ts",
        subscribers: "./src/subscribers.ts",
        utils: "./src/utils.ts"
    },
    output: {
        filename: "./dist/[name].js",
        libraryTarget: "umd"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                options: {
                }
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx"]
    },
    externals: externalsResolver
};
