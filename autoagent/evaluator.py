"""Evaluator script to run linting, type checks, and tests."""

from __future__ import annotations

import argparse
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import List, Sequence

PROJECT_ROOT = Path(__file__).resolve().parents[1]

TARGET_RUFF_PATHS = [
    "backend/models/inventory.py",
    "backend/alembic/env.py",
    "backend/alembic/versions/1e6d2f80f5a1_inventory_core.py",
    "backend/tests_inventory",
    "autoagent",
]

TARGET_BLACK_PATHS = TARGET_RUFF_PATHS
MYPY_COMMAND = [
    "python",
    "-m",
    "mypy",
    "--ignore-missing-imports",
    "--follow-imports=skip",
    "-m",
    "backend.models.inventory",
]


@dataclass
class Check:
    name: str
    command: Sequence[str]
    cwd: Path | None = None


CHECKS: List[Check] = [
    Check("ruff", ["ruff", "check", *TARGET_RUFF_PATHS]),
    Check("black", ["black", "--check", *TARGET_BLACK_PATHS]),
    Check("mypy", MYPY_COMMAND),
    Check(
        "pytest",
        [
            "pytest",
            "backend/tests_inventory/test_inventory_models.py",
            "--maxfail=1",
            "--disable-warnings",
            "--cov=backend.models.inventory",
            "--cov-report=term-missing",
            "--cov-fail-under=85",
        ],
    ),
]


def run_check(check: Check, verbose: bool = False) -> int:
    print(f"\n=== Running {check.name} ===")
    try:
        result = subprocess.run(
            list(check.command),
            cwd=(check.cwd or PROJECT_ROOT),
            check=False,
            capture_output=not verbose,
            text=True,
        )
    except FileNotFoundError:
        print(f"Missing command for {check.name}: {check.command[0]}")
        return 127
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)
    if result.returncode == 0:
        print(f"{check.name}: OK")
    else:
        print(f"{check.name}: FAILED ({result.returncode})")
    return result.returncode


def main(argv: List[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run auto-agent quality checks")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args(argv)

    failed = False
    for check in CHECKS:
        code = run_check(check, verbose=args.verbose)
        if code != 0:
            failed = True
            break
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
