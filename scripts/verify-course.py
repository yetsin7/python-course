"""Verify course structure, documented Python functions and exact example outputs."""

import argparse
import ast
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def authored_files() -> list[Path]:
    """Enumerate source materials while excluding generated environments and evidence."""
    paths = []
    for path in ROOT.rglob("*"):
        if path.is_file() and not {"build", "__pycache__", ".git", ".venv", "node_modules"}.intersection(path.relative_to(ROOT).parts):
            paths.append(path)
    return paths


def verify_sources() -> int:
    """Reject undocumented Python callables, invalid filenames and oversized authored files."""
    checked_count = 0
    for path in authored_files():
        framework_test = re.fullmatch(r"test_[a-z]+\.py", path.name)
        if not framework_test and path.name not in {"Dockerfile", "README.md", ".gitignore", ".dockerignore"}:
            if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+)?", path.name):
                raise AssertionError(f"Nonconforming file name: {path.relative_to(ROOT)}")
        if path.suffix not in {".py", ".js", ".css", ".html", ".json", ".md", ".yml", ".txt", ".csv"}:
            continue
        source = path.read_text(encoding="utf-8")
        if path.name != "course-content.js" and len(source.splitlines()) > 400:
            raise AssertionError(f"Authored file exceeds 400 lines: {path.relative_to(ROOT)}")
        if path.suffix == ".py":
            tree = ast.parse(source, filename=str(path))
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and not ast.get_docstring(node):
                    raise AssertionError(f"Missing function documentation: {path.name}:{node.lineno}")
        checked_count += 1
    return checked_count


def verify_lessons() -> int:
    """Require complete authored lessons and compare runnable examples with their expected outputs."""
    lessons = sorted((ROOT / "locales/es/lessons").glob("*.json"))
    if len(lessons) != 32:
        raise AssertionError("Expected 32 lessons.")
    catalog = json.loads((ROOT / "locales/es/catalog.json").read_text(encoding="utf-8"))
    required_fields = {"id", "slug", "phase", "title", "objectives", "concepts", "example",
                       "output", "walkthrough", "exercises", "quiz", "mastery", "references"}
    for identifier, lesson_path in enumerate(lessons, start=1):
        lesson = json.loads(lesson_path.read_text(encoding="utf-8"))
        if not required_fields.issubset(lesson) or lesson["id"] != identifier:
            raise AssertionError(f"Incomplete lesson: {lesson_path.name}")
        if len(lesson["exercises"]) != 3 or len(lesson["mastery"]) != 3 or len(lesson["concepts"]) < 5:
            raise AssertionError(f"Insufficient learning material: {lesson_path.name}")
        for key in lesson["references"]:
            if key not in catalog["references"]:
                raise AssertionError(f"Unknown reference: {key}")
        result = subprocess.run(
            [sys.executable, str(ROOT / lesson["example"])], input=lesson.get("stdin", ""),
            text=True, capture_output=True, cwd=ROOT, timeout=15,
        )
        if result.returncode or result.stdout != lesson["output"]:
            raise AssertionError(
                f"Example mismatch: {lesson_path.name}\nExpected: {lesson['output']!r}\n"
                f"Actual: {result.stdout!r}\nError: {result.stderr}")
    return len(lessons)


def verify_beginner_material() -> int:
    """Require a plain-language summary and new vocabulary for every lesson, plus the setup guide."""
    notes = json.loads((ROOT / "locales/es/beginner-notes.json").read_text(encoding="utf-8"))
    if [note["id"] for note in notes] != list(range(1, 33)):
        raise AssertionError("Beginner notes must cover lessons 1 to 32 in order.")
    for note in notes:
        if len(note["plain"]) < 120 or len(note["terms"]) < 3:
            raise AssertionError(f"Beginner note is too thin: lesson {note['id']}")
        for pair in note["terms"]:
            if len(pair) != 2 or not all(pair):
                raise AssertionError(f"Invalid vocabulary entry: lesson {note['id']}")
    setup = json.loads((ROOT / "locales/es/getting-started.json").read_text(encoding="utf-8"))
    for section in setup["sections"]:
        if not section["title"] or not (section.get("steps") or section.get("definitions")):
            raise AssertionError(f"Setup section has no actionable content: {section.get('title')}")
    return len(notes)


def verify_projects(api_python: Path | None) -> list[dict]:
    """Run project contracts in separate processes so similarly named modules cannot collide."""
    records = []
    for project in sorted((ROOT / "projects").iterdir()):
        if not project.is_dir():
            continue
        if project.name.startswith("05") and api_python is None:
            records.append({"project": project.name, "status": "not_run", "reason": "API interpreter not supplied."})
            continue
        interpreter = str(api_python) if project.name.startswith("05") else sys.executable
        result = subprocess.run(
            [interpreter, "-m", "unittest", "discover", "-s", "tests", "-p", "test_*.py", "-v"],
            cwd=project, text=True, capture_output=True, timeout=60,
        )
        if result.returncode:
            raise AssertionError(f"Project failed: {project.name}\n{result.stdout}\n{result.stderr}")
        records.append({"project": project.name, "status": "passed", "details": result.stderr.strip()})
    return records


def main() -> None:
    """Save verification evidence inside this course's build directory."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--api-python", type=Path, help="Interpreter with the API's locked dependencies installed.")
    options = parser.parse_args()
    api_python = options.api_python.resolve() if options.api_python else None
    report = {
        "python": sys.version.split()[0], "authored_files_checked": verify_sources(),
        "examples_passed": verify_lessons(), "beginner_notes": verify_beginner_material(), "projects": verify_projects(api_python),
        "public_deployment": "not_run", "docker": "not_run", "github_actions": "not_run",
    }
    (ROOT / "build").mkdir(exist_ok=True)
    (ROOT / "build/verification.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"Verified {report['examples_passed']} exact-output examples and {len(report['projects'])} project records.")
    print(f"Checked {report['authored_files_checked']} authored files and Python function documentation.")


if __name__ == "__main__":
    main()
