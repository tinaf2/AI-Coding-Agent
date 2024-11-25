import ast
import sys
import json

def find_enclosing_context(file_content, line_start, line_end):
    try:
        tree = ast.parse(file_content)
        largest_size = 0
        largest_enclosing_context = None
        
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                # For functions and classes, calculate an end line as the last line in the body
                end_line = node.lineno  # Start with the line of the function/class declaration
                if isinstance(node.body[-1], (ast.Expr, ast.Return, ast.Pass)):
                    end_line = node.body[-1].lineno  # End line will be the last statement's line number
                
                # Check if the node's line range includes the specified range
                if node.lineno <= line_start and end_line >= line_end:
                    size = end_line - node.lineno
                    if size > largest_size:
                        largest_size = size
                        largest_enclosing_context = {
                            "name": node.name,
                            "start_line": node.lineno,
                            "end_line": end_line
                        }
        
        if largest_enclosing_context:
            return json.dumps(largest_enclosing_context)
        else:
            return json.dumps({"error": "No enclosing context found"})
    except SyntaxError as e:
        # If there's a syntax error, return it in a valid JSON format
        error_result = {
            "error": str(e),
            "line": e.lineno,
            "col": e.offset,
            "message": e.msg
        }
        return json.dumps(error_result)

def dry_run(file_content):
    try:
        ast.parse(file_content)
        return {"valid": True, "error": ""}
    except SyntaxError as exc:
        return {"valid": False, "error": str(exc)}

if __name__ == "__main__":
    # Check for arguments
    if len(sys.argv) < 2:
        print(json.dumps({"error": "File path is required"}))
        sys.exit(1)
    
    # Read the Python code from the file path argument
    file_path = sys.argv[1]
    
    # Handle line range arguments only for find_enclosing_context
    if len(sys.argv) == 4:
        line_start = int(sys.argv[2])
        line_end = int(sys.argv[3])

        # Read the file content
        try:
            with open(file_path, 'r') as file:
                file_content = file.read()

            # Get the enclosing context
            result = find_enclosing_context(file_content, line_start, line_end)
            print(result)  # Output the result (either error or enclosing context)

        except Exception as e:
            print(json.dumps({"error": str(e)}))  # If the file doesn't exist or any other error
    else:
        # If no line range arguments, just check syntax
        try:
            with open(file_path, 'r') as file:
                file_content = file.read()
                
            result = dry_run(file_content)
            print(json.dumps(result))  # Print the syntax check result
        except Exception as e:
            print(json.dumps({"error": str(e)}))  # If the file doesn't exist or any other error
