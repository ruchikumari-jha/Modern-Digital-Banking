import os
import re

directory = r"c:\Users\ruchi\Modern-Digital-Banking\Frontend\src"

# This regex finds "http://localhost:8000" or 'http://localhost:8000' or `http://localhost:8000`
# and replaces it with `import.meta.env.VITE_API_BASE_URL` intelligently.

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith((".js", ".jsx", ".ts", ".tsx")):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Simple assignments
            content = content.replace("const API_BASE_URL = 'http://localhost:8000';", "const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';")
            content = content.replace('const BASE_URL = "http://localhost:8000";', 'const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";')
            content = content.replace("const API_BASE_URL = \"http://localhost:8000\";", "const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || \"http://localhost:8000\";")
            
            # Replaces inside backticks (template literals)
            content = content.replace('`http://localhost:8000', '`${import.meta.env.VITE_API_BASE_URL || \'http://localhost:8000\'}')
            
            # Replaces inside double quotes
            # e.g., "http://localhost:8000/api" -> `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api`
            content = re.sub(r'"http://localhost:8000(.*?)"', r'`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}\1`', content)
            
            # Replaces inside single quotes
            # e.g., 'http://localhost:8000/api' -> `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api`
            content = re.sub(r"'http://localhost:8000(.*?)'", r'`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}\1`', content)

            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {filepath}")
