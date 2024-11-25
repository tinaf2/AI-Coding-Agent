import { AbstractParser, EnclosingContext } from "../../constants";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export class PythonParser implements AbstractParser {
  // Method to check for syntax errors in the Python code
  // Method to check for syntax errors in the Python code
  async dryRun(file: string): Promise<{ valid: boolean; error: string }> {
    try {
      // Run the Python script to check for errors in the code
      const { stdout, stderr } = await execPromise(
        `python3 validatePython.py "${file}"`
      );

      // Log stdout and stderr to inspect them
      console.log("Python script stdout:", stdout); // Log stdout
      console.error("Python script stderr:", stderr); // Log stderr

      // If there's an error in stderr, return as invalid
      if (stderr) {
        console.error("stderr error:", stderr);
        return { valid: false, error: stderr };
      }

      // If no errors in stderr, check if the stdout contains error info in JSON format
      let result;
      try {
        result = JSON.parse(stdout); // Try to parse stdout as JSON
      } catch (parseError) {
        console.error("Error parsing stdout:", parseError);
        return { valid: false, error: "Failed to parse Python script output" };
      }

      // If the result contains an error field, it's invalid
      if (result && result.error) {
        return { valid: false, error: result.error };
      }

      // If no errors, return valid
      return { valid: true, error: "" };
    } catch (error) {
      // Catch any other errors and log them
      console.error("Error in PythonParser:", error);
      return { valid: false, error: error.message };
    }
  }

  async findEnclosingContext(
    file: string,
    lineStart: number,
    lineEnd: number
  ): Promise<EnclosingContext | null> {
    try {
      // Run the Python script to find the enclosing context for the specified line range
      const { stdout, stderr } = await execPromise(
        `python3 validatePython.py "${file}" ${lineStart} ${lineEnd}`
      );

      // Log stderr to check for errors
      if (stderr) {
        console.error("Python script stderr error:", stderr);
        return null;
      }

      // Log stdout for debugging
      console.log("Python script stdout:", stdout);

      // Parse the result (stdout) from the Python script, which contains JSON
      let result;
      try {
        result = JSON.parse(stdout); // Parse stdout as JSON
      } catch (error) {
        console.error("Error parsing Python output:", error);
        return null;
      }

      // If there's an error field in the parsed result, it's invalid
      if (result.error) {
        console.error("Python script error:", result.error);
        return null;
      }

      // Return the enclosing context based on the result
      return {
        enclosingContext: {
          name: result.name,
          startLine: result.start_line,
          endLine: result.end_line,
        },
      };
    } catch (error) {
      console.error("Error in PythonParser:", error);
      return null;
    }
  }
}
