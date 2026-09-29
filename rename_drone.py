import os

replacements = {
    "Drone AI": "Raksha AI",
    "DRONE AI": "RAKSHA AI",
    "DRONE-": "RAKSHA-",
    "drone-": "raksha-"
}

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root or 'dist' in root:
        continue
    for file in files:
        if file.endswith(('.ts', '.tsx', '.html', '.md', '.json', '.yaml')):
            replace_in_file(os.path.join(root, file))

# Fix the 'D' to 'R' in the logo in Header.tsx
header_path = 'src/components/layout/Header.tsx'
if os.path.exists(header_path):
    with open(header_path, 'r') as f:
        content = f.read()
    
    # Very specific replacement to avoid changing random 'D's
    content = content.replace('<div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-foreground italic shrink-0">\n            D\n          </div>',
                              '<div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-foreground italic shrink-0">\n            R\n          </div>')
    with open(header_path, 'w') as f:
        f.write(content)
