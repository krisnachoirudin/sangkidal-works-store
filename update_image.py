#!/usr/bin/env python3
import re

# Read the HTML file
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the base64 data URL with the new image file path
pattern = r"url\('data:image/jpeg;base64,[^']+'\)"
replacement = "url('assets/opening-bg.jpg.png')"

new_content = re.sub(pattern, replacement, content)

# Write back the updated content
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('✓ Background image URL updated to: assets/opening-bg.jpg.png')
