const [, , script, command, buildType] = process.argv;
const { WindowsBuilder } = require("./build-windows");

console.log("🚀 WellStation Backend Windows Build Tool");
console.log(
  `Script: ${script}, Command: ${command}, Build Type: ${buildType || "prod"}`
);

switch (script) {
  case "build":
    return buildWindowsPython();

  default:
    console.log(`
�� Available commands:
  node scripts/dispatch-windows.js build python [dev|prod]  - Build Python backend for Windows
  
🎯 Examples:
  npm run build:python:windows:prod  - Build Python backend for Windows (production)
  npm run build:python:windows:dev   - Build Python backend for Windows (development)
    `);
    process.exit(1);
}

function buildWindowsPython() {
  console.log("🔨 Building Python backend for Windows...");

  const builder = new WindowsBuilder();

  try {
    builder.buildPython(buildType);
    builder.testExecutable();
    console.log("✅ Windows build process completed!");
  } catch (error) {
    console.error("❌ Build process failed:", error.message);
    // Clean up any running processes even if build failed
    builder.cleanupRunningProcesses();
    process.exit(1);
  }
}
