import os
import re

target_dir = r"c:\Kaycris\Mister_Banking\app"

replacements = {
    "Mister Admin": "System Administrator",
    "Mister, ": "",
    "mister, ": "",
    "MISTER, ": "",
    ", Mister.": ".",
    ", mister.": ".",
    ", Mister!": "!",
    ", mister!": "!",
    "Mister's": "System's",
    "Mister ": "System ",
    "mister ": "system ",
    "Mister": "Administrator",
    "mister": "administrator",
    "Citizen": "User",
    "citizen": "user",
    "CITIZEN": "USER"
}

for root, _, files in os.walk(target_dir):
    for file in files:
        if file.endswith(".py"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()

            orig_content = content
            # apply replacements sequentially
            for k, v in replacements.items():
                content = content.replace(k, v)
                
            if content != orig_content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Updated {filepath}")
