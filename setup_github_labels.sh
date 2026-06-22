#!/usr/bin/env bash
# Gurimaal — GitHub label setup
#
# Requirements:
#   1. GitHub CLI installed: https://cli.github.com
#   2. Authenticated: run `gh auth login` once before running this script
#
# Usage:
#   chmod +x setup_github_labels.sh
#   ./setup_github_labels.sh Gurimaal/gurimaal
#
# (replace Gurimaal/gurimaal with your actual <org>/<repo> if different)

set -e

REPO="${1:?Usage: ./setup_github_labels.sh <owner>/<repo>}"

echo "Creating labels on $REPO ..."

create_label () {
  local name="$1" color="$2" desc="$3"
  if gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" --force; then
    echo "  ✓ $name"
  else
    echo "  ✗ failed: $name"
  fi
}

# --- Domain labels (matches AGENTS.md Section 3) ---
create_label "property-structure" "8B5CF6" "Real Estate Project / Building / Floor / Unit"
create_label "tenancy-crm"        "0E7C7B" "Tenant / User / Customer / Contract / Auto Repeat"
create_label "utility-billing"    "5B7FBF" "Meter Reading / Bill Structure / Billing Settings"
create_label "service-finance"    "C8923A" "Service Request / Sales Order / Invoice / Payment"
create_label "maintenance"        "B25B6E" "Maintenance Request / Job / Checklist / Vendor"

# --- Priority labels ---
create_label "priority: high"   "D73A49" "Blocks other work or affects billing accuracy"
create_label "priority: medium" "FBCA04" "Normal priority"
create_label "priority: low"    "0E8A16" "Nice to have, no urgency"

# --- Type labels ---
create_label "type: bug"           "D73A49" "Something is broken"
create_label "type: feature"       "1D76DB" "New functionality"
create_label "type: chore"         "C5DEF5" "Refactor, cleanup, config, docs"
create_label "type: needs-review"  "FEF2C0" "Waiting on code review"

echo "Done. Labels created on $REPO."