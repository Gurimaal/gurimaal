def apply_adjustments(amount, rules):

    # sort rules by priority (lower number first)
    rules = sorted(rules, key=lambda x: x.priority)

    for rule in rules:

        if rule.rule_type == "Discount":
            amount -= amount * (rule.amount_or_percent / 100)

        elif rule.rule_type == "Surcharge":
            amount += amount * (rule.amount_or_percent / 100)

    return amount