import os
import re

DELTA_LAT = 45.438 - 13.030
DELTA_LNG = 12.327 - 80.225

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    def replace_coord(match):
        num_str = match.group(0)
        num = float(num_str)
        if 12.0 < num < 14.0:
            return f"{(num + DELTA_LAT):.4f}"
        elif 79.0 < num < 81.0:
            return f"{(num + DELTA_LNG):.4f}"
        return num_str

    # Match numbers like 13.0355, 80.220, etc.
    new_content = re.sub(r'\b13\.0\d+\b|\b80\.2\d+\b', replace_coord, content)
    
    # Also handle some edge cases if there are any like 13.03
    new_content = re.sub(r'\b13\.03\b', str(round(13.03 + DELTA_LAT, 4)), new_content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            process_file(os.path.join(root, file))
