#!/usr/bin/env python3
"""
Validates jobs/*.json against the exact schema pitch.js expects.
Run manually: python3 validate_job_config.py [file ...]
With no args, validates every file in jobs/.
Also run automatically in CI (.github/workflows/static.yml) before every deploy.

This exists because on 2026-07-05 five job configs (66degrees, tilt, level-ai,
beacon-hill, kapitus) were built against a schema that looked reasonable but did not
match what pitch.js actually reads (e.g. "hero": {...} instead of top-level "company"/
"role", "the_case" items using "requirement"/"evidence" instead of "need"/"answer",
"the_ramp" as an object instead of an array). The pages returned 200 (file existed) but
rendered nothing useful, and this went unnoticed until a manual check. This script
turns that class of bug into a hard failure before it ever reaches production.
"""

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent
JOBS_DIR = REPO_ROOT / "jobs"


def fail(path, msg):
    return f"{path.name}: {msg}"


def is_list_of_str(x):
    return isinstance(x, list) and all(isinstance(i, str) for i in x)


def validate(path):
    errors = []

    try:
        cfg = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        return [fail(path, f"invalid JSON — {e}")]

    if not isinstance(cfg, dict):
        return [fail(path, "top-level value must be a JSON object")]

    # ── Required top-level scalars ──────────────────────────────────────────
    for key in ("company", "role", "slug"):
        if key not in cfg:
            errors.append(fail(path, f"missing required top-level key \"{key}\""))
        elif not isinstance(cfg[key], str) or not cfg[key].strip():
            errors.append(fail(path, f"\"{key}\" must be a non-empty string"))

    # ── the_case: list of {need, answer, detail?} ───────────────────────────
    the_case = cfg.get("the_case")
    if not isinstance(the_case, list) or not the_case:
        errors.append(fail(path, "\"the_case\" must be a non-empty array"))
    else:
        for i, item in enumerate(the_case):
            if not isinstance(item, dict):
                errors.append(fail(path, f"the_case[{i}] must be an object"))
                continue
            for req in ("need", "answer"):
                if not isinstance(item.get(req), str) or not item[req].strip():
                    errors.append(fail(path, f"the_case[{i}].{req} must be a non-empty string (not 'requirement'/'evidence')"))
            if "detail" in item and not isinstance(item["detail"], str):
                errors.append(fail(path, f"the_case[{i}].detail must be a string if present"))

    # ── the_stack: {headline?, subhead?, nodes: [{label, desc, pm_role?}]} ──
    the_stack = cfg.get("the_stack")
    if not isinstance(the_stack, dict):
        errors.append(fail(path, "\"the_stack\" must be an object"))
    else:
        nodes = the_stack.get("nodes")
        if not isinstance(nodes, list) or not nodes:
            errors.append(fail(path, "the_stack.nodes must be a non-empty array (not the_stack.tools)"))
        else:
            for i, node in enumerate(nodes):
                if not isinstance(node, dict):
                    errors.append(fail(path, f"the_stack.nodes[{i}] must be an object"))
                    continue
                for req in ("label", "desc"):
                    if not isinstance(node.get(req), str) or not node[req].strip():
                        errors.append(fail(path, f"the_stack.nodes[{i}].{req} must be a non-empty string"))

    # ── when_things_break: [{scenario, response: [str, ...]}] ───────────────
    wtb = cfg.get("when_things_break")
    if not isinstance(wtb, list) or not wtb:
        errors.append(fail(path, "\"when_things_break\" must be a non-empty array"))
    else:
        for i, incident in enumerate(wtb):
            if not isinstance(incident, dict):
                errors.append(fail(path, f"when_things_break[{i}] must be an object"))
                continue
            if not isinstance(incident.get("scenario"), str) or not incident["scenario"].strip():
                errors.append(fail(path, f"when_things_break[{i}].scenario must be a non-empty string"))
            if not is_list_of_str(incident.get("response")):
                errors.append(fail(path, f"when_things_break[{i}].response must be an array of strings (not a single string)"))

    # ── how_i_run_a_room: [str, ...] ─────────────────────────────────────────
    if not is_list_of_str(cfg.get("how_i_run_a_room")):
        errors.append(fail(path, "\"how_i_run_a_room\" must be an array of strings"))

    # ── track_record: [{company, role, period, points: [str,...]}] ──────────
    track_record = cfg.get("track_record")
    if not isinstance(track_record, list) or not track_record:
        errors.append(fail(path, "\"track_record\" must be a non-empty array"))
    else:
        for i, entry in enumerate(track_record):
            if not isinstance(entry, dict):
                errors.append(fail(path, f"track_record[{i}] must be an object"))
                continue
            for req in ("company", "role", "period"):
                if not isinstance(entry.get(req), str) or not entry[req].strip():
                    errors.append(fail(path, f"track_record[{i}].{req} must be a non-empty string"))
            if not is_list_of_str(entry.get("points")):
                errors.append(fail(path, f"track_record[{i}].points must be an array of strings"))

    # ── sr_partner: {before: [str,...], after: [str,...]} ────────────────────
    sr_partner = cfg.get("sr_partner")
    if not isinstance(sr_partner, dict):
        errors.append(fail(path, "\"sr_partner\" must be an object (not sr_pm_partner)"))
    else:
        for req in ("before", "after"):
            if not is_list_of_str(sr_partner.get(req)):
                errors.append(fail(path, f"sr_partner.{req} must be an array of strings (not a single string)"))

    # ── the_ramp: [{timeframe, deliverable}] ─────────────────────────────────
    the_ramp = cfg.get("the_ramp")
    if not isinstance(the_ramp, list) or not the_ramp:
        errors.append(fail(path, "\"the_ramp\" must be an array of {timeframe, deliverable} objects (not a {day_one, thirty_days} object)"))
    else:
        for i, item in enumerate(the_ramp):
            if not isinstance(item, dict):
                errors.append(fail(path, f"the_ramp[{i}] must be an object"))
                continue
            for req in ("timeframe", "deliverable"):
                if not isinstance(item.get(req), str) or not item[req].strip():
                    errors.append(fail(path, f"the_ramp[{i}].{req} must be a non-empty string"))

    return errors


def main():
    args = sys.argv[1:]
    if args:
        targets = [Path(a) for a in args]
    else:
        targets = sorted(JOBS_DIR.glob("*.json"))

    if not targets:
        print("No job config files found to validate.")
        sys.exit(1)

    all_errors = []
    for path in targets:
        if not path.exists():
            all_errors.append(fail(path, "file not found"))
            continue
        errs = validate(path)
        if errs:
            all_errors.extend(errs)
        else:
            print(f"OK   {path.name}")

    if all_errors:
        print("\nFAILED:")
        for e in all_errors:
            print(f"  - {e}")
        print(f"\n{len(all_errors)} error(s) across job config(s). Fix before deploying.")
        sys.exit(1)

    print(f"\nAll {len(targets)} job config(s) valid.")


if __name__ == "__main__":
    main()
