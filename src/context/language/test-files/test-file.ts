import { PythonParser } from "../python-parser";

const pythonParser = new PythonParser();

async function runTests() {
  // Test with valid Python code
  const validFile = "./valid-syntax.py"; // Path to valid test file
  const validResult = await pythonParser.dryRun(validFile);
  console.log("Valid Test:", validResult); // Should log: { valid: true, error: "" }

  // Test with invalid Python code
  const invalidFile = "./invalid-syntax.py"; // Path to invalid test file
  const invalidResult = await pythonParser.dryRun(invalidFile);
  console.log("Invalid Test:", invalidResult); // Should log: { valid: false, error: "SyntaxError: invalid syntax" }

  // Test with a valid line range (e.g., the `greet` function)
  const validRangeResult = await pythonParser.findEnclosingContext(
    "./test-enclosing-context.py",
    4,
    5
  );
  console.log("Valid Range Test:", validRangeResult); // Expected: { enclosingContext: { name: "greet", startLine: 4, endLine: 5 } }

  // Test with an invalid line range (no function or class)
  const invalidRangeResult = await pythonParser.findEnclosingContext(
    "./test-enclosing-context.py",
    10,
    15
  );
  console.log("Invalid Range Test:", invalidRangeResult); // Expected: { enclosingContext: null }
}

runTests();
