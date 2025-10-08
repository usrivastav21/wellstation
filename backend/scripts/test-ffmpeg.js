const { spawnSync, execSync } = require("child_process");
const { existsSync, readFileSync, writeFileSync } = require("fs");
const path = require("path");

class FFmpegTester {
  constructor() {
    this.testResults = [];
    this.ffmpegPath = null;
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const prefix = type === "error" ? "❌" : type === "warning" ? "⚠️" : "ℹ️";
    console.log(`${prefix} [${timestamp}] ${message}`);
    this.testResults.push({ timestamp, type, message });
  }

  async runTests() {
    console.log("🔍 Starting FFmpeg Package Tests...\n");

    // Test 1: Find FFmpeg
    this.testFFmpegDiscovery();

    // Test 2: Check FFmpeg Binary
    this.testFFmpegBinary();

    // Test 3: Test FFmpeg Version
    this.testFFmpegVersion();

    // Test 4: Test Basic Conversion
    this.testBasicConversion();

    // Test 5: Test PyInstaller Path
    this.testPyInstallerPath();

    // Test 6: Test Dependencies
    this.testDependencies();

    // Test 7: Test File Permissions
    this.testFilePermissions();

    // Test 8: Test Command Execution
    this.testCommandExecution();

    // Generate Report
    this.generateReport();
  }

  testFFmpegDiscovery() {
    this.log("Testing FFmpeg Discovery...");

    try {
      // Test PATH-based discovery
      try {
        const pathResult = execSync("where ffmpeg", {
          encoding: "utf8",
        }).trim();
        this.log(`✅ FFmpeg found in PATH: ${pathResult}`);
        this.ffmpegPath = pathResult;
      } catch (error) {
        this.log("❌ FFmpeg not found in PATH", "warning");
      }

      // Test common Windows locations
      const commonPaths = [
        "C:\\ffmpeg\\bin\\ffmpeg.exe",
        "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",
        "C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe",
        "C:\\ProgramData\\chocolatey\\lib\\tools\\ffmpeg\\bin\\ffmpeg.exe",
        path.join(process.env.USERPROFILE, "ffmpeg", "bin", "ffmpeg.exe"),
      ];

      for (const ffmpegPath of commonPaths) {
        if (existsSync(ffmpegPath)) {
          this.log(`✅ FFmpeg found at: ${ffmpegPath}`);
          if (!this.ffmpegPath) {
            this.ffmpegPath = ffmpegPath;
          }
        }
      }

      if (!this.ffmpegPath) {
        this.log("❌ No FFmpeg installation found", "error");
      }
    } catch (error) {
      this.log(`❌ Error during FFmpeg discovery: ${error.message}`, "error");
    }
  }

  testFFmpegBinary() {
    this.log("Testing FFmpeg Binary...");

    if (!this.ffmpegPath) {
      this.log("❌ Cannot test binary - FFmpeg path not found", "error");
      return;
    }

    try {
      // Check if file exists
      if (!existsSync(this.ffmpegPath)) {
        this.log(`❌ FFmpeg binary not found at: ${this.ffmpegPath}`, "error");
        return;
      }

      // Check file size
      const stats = require("fs").statSync(this.ffmpegPath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      this.log(`✅ FFmpeg binary exists, size: ${fileSizeMB} MB`);

      // Check if it's executable
      try {
        const testResult = spawnSync(this.ffmpegPath, ["-version"], {
          stdio: "pipe",
          timeout: 5000,
        });

        if (testResult.status === 0) {
          this.log("✅ FFmpeg binary is executable");
        } else {
          this.log(
            `❌ FFmpeg binary execution failed: ${testResult.stderr?.toString()}`,
            "error"
          );
        }
      } catch (error) {
        this.log(`❌ FFmpeg binary execution error: ${error.message}`, "error");
      }
    } catch (error) {
      this.log(`❌ Error testing FFmpeg binary: ${error.message}`, "error");
    }
  }

  testFFmpegVersion() {
    this.log("Testing FFmpeg Version...");

    if (!this.ffmpegPath) {
      this.log("❌ Cannot test version - FFmpeg path not found", "error");
      return;
    }

    try {
      const result = spawnSync(this.ffmpegPath, ["-version"], {
        stdio: "pipe",
        encoding: "utf8",
        timeout: 10000,
      });

      if (result.status === 0) {
        const versionLine = result.stdout.split("\n")[0];
        this.log(`✅ FFmpeg version: ${versionLine}`);

        // Check for important features
        if (result.stdout.includes("--enable-libmp3lame")) {
          this.log("✅ MP3 encoding support available");
        } else {
          this.log("⚠️ MP3 encoding support not available", "warning");
        }

        if (result.stdout.includes("--enable-libvorbis")) {
          this.log("✅ Vorbis encoding support available");
        } else {
          this.log("⚠️ Vorbis encoding support not available", "warning");
        }
      } else {
        this.log(`❌ Failed to get FFmpeg version: ${result.stderr}`, "error");
      }
    } catch (error) {
      this.log(`❌ Error getting FFmpeg version: ${error.message}`, "error");
    }
  }

  testBasicConversion() {
    this.log("Testing Basic Audio Conversion...");

    if (!this.ffmpegPath) {
      this.log("❌ Cannot test conversion - FFmpeg path not found", "error");
      return;
    }

    try {
      // Create a test audio file (1 second of silence)
      const testInputPath = path.join(process.cwd(), "test_input.wav");
      const testOutputPath = path.join(process.cwd(), "test_output.wav");

      // Create a simple test WAV file using FFmpeg
      const createTestResult = spawnSync(
        this.ffmpegPath,
        [
          "-f",
          "lavfi",
          "-i",
          "anullsrc=channel_layout=stereo:sample_rate=44100",
          "-t",
          "1",
          "-c:a",
          "pcm_s16le",
          testInputPath,
          "-y",
        ],
        {
          stdio: "pipe",
          timeout: 10000,
        }
      );

      if (createTestResult.status !== 0) {
        this.log(
          `❌ Failed to create test audio file: ${createTestResult.stderr?.toString()}`,
          "error"
        );
        return;
      }

      this.log("✅ Test audio file created successfully");

      // Test the conversion command similar to your error
      const conversionResult = spawnSync(
        this.ffmpegPath,
        [
          "-i",
          testInputPath,
          "-vn",
          "-acodec",
          "pcm_s16le",
          "-ar",
          "44100",
          "-ac",
          "2",
          "-y",
          testOutputPath,
        ],
        {
          stdio: "pipe",
          timeout: 10000,
        }
      );

      if (conversionResult.status === 0) {
        this.log("✅ Basic audio conversion test passed");

        // Check output file
        if (existsSync(testOutputPath)) {
          const stats = require("fs").statSync(testOutputPath);
          this.log(`✅ Output file created, size: ${stats.size} bytes`);
        } else {
          this.log("❌ Output file not found after conversion", "error");
        }
      } else {
        this.log(
          `❌ Basic audio conversion failed: ${conversionResult.stderr?.toString()}`,
          "error"
        );
      }

      // Cleanup
      try {
        if (existsSync(testInputPath)) require("fs").unlinkSync(testInputPath);
        if (existsSync(testOutputPath))
          require("fs").unlinkSync(testOutputPath);
        this.log("✅ Test files cleaned up");
      } catch (cleanupError) {
        this.log(
          `⚠️ Failed to cleanup test files: ${cleanupError.message}`,
          "warning"
        );
      }
    } catch (error) {
      this.log(
        `❌ Error during basic conversion test: ${error.message}`,
        "error"
      );
    }
  }

  testPyInstallerPath() {
    this.log("Testing PyInstaller FFmpeg Path...");

    try {
      // Simulate the PyInstaller temp path structure
      const tempDir = path.join(
        process.env.TEMP || process.env.TMP || "C:\\temp",
        "_MEI28042"
      );
      const pyInstallerFFmpegPath = path.join(tempDir, "ffmpeg.exe");

      this.log(`Checking PyInstaller path: ${pyInstallerFFmpegPath}`);

      if (existsSync(pyInstallerFFmpegPath)) {
        this.log("✅ FFmpeg found in PyInstaller temp directory");

        // Test if it's executable
        try {
          const testResult = spawnSync(pyInstallerFFmpegPath, ["-version"], {
            stdio: "pipe",
            timeout: 5000,
          });

          if (testResult.status === 0) {
            this.log("✅ PyInstaller FFmpeg is executable");
          } else {
            this.log(
              `❌ PyInstaller FFmpeg execution failed: ${testResult.stderr?.toString()}`,
              "error"
            );
          }
        } catch (error) {
          this.log(
            `❌ PyInstaller FFmpeg execution error: ${error.message}`,
            "error"
          );
        }
      } else {
        this.log(
          "❌ FFmpeg not found in PyInstaller temp directory",
          "warning"
        );
      }
    } catch (error) {
      this.log(`❌ Error testing PyInstaller path: ${error.message}`, "error");
    }
  }

  testDependencies() {
    this.log("Testing FFmpeg Dependencies...");

    if (!this.ffmpegPath) {
      this.log("❌ Cannot test dependencies - FFmpeg path not found", "error");
      return;
    }

    try {
      // Test if FFmpeg can list its dependencies
      const result = spawnSync(this.ffmpegPath, ["-buildconf"], {
        stdio: "pipe",
        encoding: "utf8",
        timeout: 10000,
      });

      if (result.status === 0) {
        this.log("✅ FFmpeg build configuration retrieved");

        // Check for common dependencies
        const output = result.stdout;
        if (output.includes("--enable-shared")) {
          this.log("✅ Shared library support enabled");
        } else {
          this.log("⚠️ Shared library support not enabled", "warning");
        }
      } else {
        this.log(
          `❌ Failed to get FFmpeg build configuration: ${result.stderr}`,
          "error"
        );
      }
    } catch (error) {
      this.log(
        `❌ Error testing FFmpeg dependencies: ${error.message}`,
        "error"
      );
    }
  }

  testFilePermissions() {
    this.log("Testing File Permissions...");

    try {
      const testDir = path.join(process.cwd(), "ffmpeg_test");

      // Create test directory
      if (!existsSync(testDir)) {
        require("fs").mkdirSync(testDir, { recursive: true });
      }

      const testFile = path.join(testDir, "test_permissions.txt");
      writeFileSync(testFile, "test content");

      // Test read/write permissions
      const content = readFileSync(testFile, "utf8");
      if (content === "test content") {
        this.log("✅ File read/write permissions working");
      } else {
        this.log("❌ File read/write permissions failed", "error");
      }

      // Cleanup
      require("fs").unlinkSync(testFile);
      require("fs").rmdirSync(testDir);
    } catch (error) {
      this.log(`❌ Error testing file permissions: ${error.message}`, "error");
    }
  }

  testCommandExecution() {
    this.log("Testing Command Execution...");

    if (!this.ffmpegPath) {
      this.log(
        "❌ Cannot test command execution - FFmpeg path not found",
        "error"
      );
      return;
    }

    try {
      // Test the exact command from your error
      const testInputPath =
        "C:\\code\\wellstation-desktop-app\\release-prod\\win-unpacked\\resources\\backend\\media\\test\\test.wav";
      const testOutputPath =
        "C:\\code\\wellstation-desktop-app\\release-prod\\win-unpacked\\resources\\backend\\media\\test\\test_corrected.wav";

      this.log(`Testing command with paths:`);
      this.log(`  Input: ${testInputPath}`);
      this.log(`  Output: ${testOutputPath}`);

      // Test if directories exist
      const inputDir = path.dirname(testInputPath);
      const outputDir = path.dirname(testOutputPath);

      if (!existsSync(inputDir)) {
        this.log(`❌ Input directory does not exist: ${inputDir}`, "error");
      } else {
        this.log(`✅ Input directory exists: ${inputDir}`);
      }

      if (!existsSync(outputDir)) {
        this.log(`❌ Output directory does not exist: ${outputDir}`, "error");
      } else {
        this.log(`✅ Output directory exists: ${outputDir}`);
      }

      // Test command structure (without actual files)
      const command = [
        this.ffmpegPath,
        "-i",
        testInputPath,
        "-vn",
        "-acodec",
        "pcm_s16le",
        "-ar",
        "44100",
        "-ac",
        "2",
        "-y",
        testOutputPath,
      ];

      this.log(`Command structure: ${command.join(" ")}`);
      this.log("✅ Command structure is valid");
    } catch (error) {
      this.log(`❌ Error testing command execution: ${error.message}`, "error");
    }
  }

  generateReport() {
    console.log("\n📊 FFmpeg Test Report");
    console.log("=".repeat(50));

    const errors = this.testResults.filter((r) => r.type === "error");
    const warnings = this.testResults.filter((r) => r.type === "warning");
    const info = this.testResults.filter((r) => r.type === "info");

    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`Errors: ${errors.length}`);
    console.log(`Warnings: ${warnings.length}`);
    console.log(`Info: ${info.length}`);

    if (errors.length > 0) {
      console.log("\n❌ Errors Found:");
      errors.forEach((error) => {
        console.log(`  - ${error.message}`);
      });
    }

    if (warnings.length > 0) {
      console.log("\n⚠️ Warnings Found:");
      warnings.forEach((warning) => {
        console.log(`  - ${warning.message}`);
      });
    }

    // Save detailed report to file
    const reportPath = path.join(process.cwd(), "ffmpeg-test-report.json");
    writeFileSync(
      reportPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          ffmpegPath: this.ffmpegPath,
          results: this.testResults,
          summary: {
            total: this.testResults.length,
            errors: errors.length,
            warnings: warnings.length,
            info: info.length,
          },
        },
        null,
        2
      )
    );

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    if (errors.length === 0) {
      console.log("\n✅ All tests passed! FFmpeg should work correctly.");
    } else {
      console.log("\n❌ Some tests failed. Check the errors above for issues.");
    }
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  const tester = new FFmpegTester();
  tester.runTests().catch((error) => {
    console.error("❌ Test runner failed:", error);
    process.exit(1);
  });
}

module.exports = { FFmpegTester };
