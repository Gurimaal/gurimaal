def calculate_bill(structure, total_units):
    amount = 0

    for slab in structure.items:
        if total_units <= 0:
            break

        slab_range = slab.to_units - slab.from_units
        used = min(total_units, slab_range)

        amount += used * slab.rate_per_unit
        amount += slab.fixed_charge or 0

        total_units -= used

    return amount