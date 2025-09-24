"""Auto-agent main loop for VALEO NeuroERP."""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List

import yaml

PROJECT_ROOT = Path(__file__).resolve().parents[1]
STATE_PATH = PROJECT_ROOT / "autoagent" / "state.json"
RULES_PATH = PROJECT_ROOT / "autoagent" / "rules.md"
TASKS_PATH = PROJECT_ROOT / "autoagent" / "tasks.yaml"
PROMPTS_DIR = PROJECT_ROOT / "autoagent" / "prompts"
SYSTEM_PROMPT_PATH = PROMPTS_DIR / "system.md"
CRITIC_PROMPT_PATH = PROMPTS_DIR / "critic.md"

LOGGER = logging.getLogger("autoagent")


def load_text(path: Path) -> str:
    if not path.exists():
        raise FileNotFoundError(f"Missing required file: {path}")
    return path.read_text(encoding="utf-8").strip()


def load_yaml(path: Path) -> Dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"Missing required YAML file: {path}")
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {}


def load_state(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {"iteration": 0, "history": []}
    # Support files saved with UTF-8 BOM
    return json.loads(path.read_text(encoding="utf-8-sig"))


def save_state(path: Path, state: Dict[str, Any]) -> None:
    path.write_text(json.dumps(state, indent=2, sort_keys=True), encoding="utf-8")


class LLMClient:
    """Minimal wrapper around OpenAI client with graceful fallback."""

    def __init__(self, model: str, temperature: float, dry_run: bool = False) -> None:
        self.model = model
        self.temperature = temperature
        self.dry_run = dry_run
        self._client = None
        if dry_run:
            LOGGER.info("Dry run active; responses will be mocked.")
            return
        try:
            from openai import OpenAI  # type: ignore
        except ImportError:  # pragma: no cover
            LOGGER.warning("openai package not available; running in dry-run mode.")
            self.dry_run = True
            return
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            LOGGER.warning("OPENAI_API_KEY not set; running in dry-run mode.")
            self.dry_run = True
            return
        self._client = OpenAI(api_key=api_key)

    def chat(self, messages: List[Dict[str, str]]) -> str:
        if self.dry_run or not self._client:
            LOGGER.info("Returning stubbed response (dry run).")
            return "[Dry-run] No LLM call executed. Review prompts and run evaluator manually."
        response = self._client.chat.completions.create(
            model=self.model,
            temperature=self.temperature,
            messages=messages,
        )
        return response.choices[0].message.content or ""


class AutoAgent:
    """Coordinates planning iterations and evaluator checks."""

    def __init__(self, args: argparse.Namespace) -> None:
        self.args = args
        self.state = load_state(STATE_PATH)
        self.rules = load_text(RULES_PATH)
        self.tasks = load_yaml(TASKS_PATH)
        self.system_prompt = load_text(SYSTEM_PROMPT_PATH)
        self.critic_prompt = load_text(CRITIC_PROMPT_PATH)
        self.client = LLMClient(
            model=args.model,
            temperature=args.temperature,
            dry_run=args.dry_run,
        )

    @property
    def iteration(self) -> int:
        return int(self.state.get("iteration", 0))

    def build_messages(self) -> List[Dict[str, str]]:
        objectives = self.tasks.get("objectives", [])
        acceptance = self.tasks.get("acceptance", [])
        constraints = self.tasks.get("constraints", [])
        summary = {
            "iteration": self.iteration,
            "objectives": objectives,
            "acceptance": acceptance,
            "constraints": constraints,
            "history": self.state.get("history", [])[-5:],
        }
        user_prompt = (
            "You are orchestrating an 11-hour sprint. "
            "Plan the next micro-iteration, propose concrete diffs, and list evaluator commands.\n\n"
            f"Rules:\n{self.rules}\n\n"
            f"Sprint context:\n{yaml.safe_dump(summary, sort_keys=False)}\n"
            "Always propose tests and risk checks."
        )
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": user_prompt},
            {"role": "system", "content": f"Critic voice:\n{self.critic_prompt}"},
        ]
        return messages

    def record_iteration(self, plan: str) -> None:
        entry = {
            "iteration": self.iteration + 1,
            "timestamp": int(time.time()),
            "plan": plan,
        }
        history: List[Dict[str, Any]] = self.state.setdefault("history", [])
        history.append(entry)
        self.state["iteration"] = entry["iteration"]
        save_state(STATE_PATH, self.state)

    def run(self) -> None:
        target_iterations = self.args.max_iterations
        for _ in range(target_iterations):
            LOGGER.info("Starting iteration %s", self.iteration + 1)
            messages = self.build_messages()
            plan = self.client.chat(messages)
            print("\n===== AUTO-AGENT PLAN START =====\n")
            print(plan)
            print("\n===== AUTO-AGENT PLAN END =====\n")
            self.record_iteration(plan)
            if self.args.once:
                LOGGER.info("Single iteration requested; stopping.")
                break
            if not self.args.force:
                LOGGER.info("Stopping after planning phase. Manual execution required.")
                break


def parse_args(argv: List[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="VALEO Auto-Agent runner")
    parser.add_argument("--max-iterations", type=int, default=1)
    parser.add_argument("--model", type=str, default="gpt-4.1")
    parser.add_argument("--temperature", type=float, default=0.1)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--once", action="store_true", help="Stop after first iteration"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Allow multiple consecutive iterations without manual review",
    )
    return parser.parse_args(argv)


def main(argv: List[str] | None = None) -> int:
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s"
    )
    args = parse_args(argv or sys.argv[1:])
    try:
        agent = AutoAgent(args)
    except Exception as exc:  # pragma: no cover
        LOGGER.error("Failed to initialise auto-agent: %s", exc)
        return 1
    agent.run()
    return 0


if __name__ == "__main__":
    sys.exit(main())
