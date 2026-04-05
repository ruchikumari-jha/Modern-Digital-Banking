import os
import re

directory = r"c:\Users\ruchi\Modern-Digital-Banking\Frontend\src"

# This regex cleans up the mess from the previous script
# e.g., `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}`}`
# should become `import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"` or within a template literal.

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith((".js", ".jsx", ".ts", ".tsx")):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # 1. Clean up nested backeticks
            # Case: `${import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}`}`
            content = re.sub(r'\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| `\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| "http://localhost:8000"\}`\}', 
                             r'${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}', content)
            
            # 2. Clean up assignments
            # Case: const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}`;
            content = re.sub(r'import\.meta\.env\.VITE_API_BASE_URL \|\| `\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| "(.*?)"\}`',
                             r'import.meta.env.VITE_API_BASE_URL || "\1"', content)

            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Cleaned {filepath}")
