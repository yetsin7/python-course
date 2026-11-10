"""Check the presence of Git without modifying an existing repository."""

import shutil
import subprocess

executable = shutil.which("git")
print(executable is not None)
if executable:
    result = subprocess.run([executable, "--version"], capture_output=True, text=True, check=True)
    print(result.stdout.startswith("git version"))
else:
    print(False)
