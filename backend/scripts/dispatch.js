const [, , script, command, buildType] = process.argv;
const { Builder } = require("./build");

/**
 * @namespace Dispatcher
 * @description - Simplified dispatcher for Python backend only
 * @argument script - Should be 'build' for building Python backend
 * @argument command - Should be 'python' for Python backend
 * @argument buildType - Should be 'dev' or 'prod' (optional, defaults to 'dev')
 */

console.log(`🚀 WellStation Backend Build Tool`);
console.log(
  `Script: ${script}, Command: ${command}, Build Type: ${buildType || "dev"}`
);

switch (script) {
  case "build":
    return buildPython();

  default:
    console.log(`
📖 Available commands:
  node scripts/dispatch.js build python [dev|prod]  - Build Python backend with PyInstaller
  
🎯 Examples:
  npm run build:python:dev              - Build Python backend (development)
  npm run build:python:prod             - Build Python backend (production)
  npm run build:python                  - Build Python backend (defaults to dev)
    `);
    process.exit(1);
}

/**
 * @description - Builds Python backend using PyInstaller
 * @memberof Dispatcher
 */
function buildPython() {
  console.log("🔨 Building Python backend...");

  const builder = new Builder();

  // Build the Python backend with specified build type
  builder.buildPython(buildType);

  // Test the built executable
  builder.testExecutable();

  console.log("✅ Build process completed!");
}
