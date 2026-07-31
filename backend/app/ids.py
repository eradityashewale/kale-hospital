import random
import string


def new_id(prefix: str) -> str:
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"{prefix}-{suffix}"


def next_sequential_id(prefix: str, existing_ids: list[str], start: int = 1000) -> str:
    max_num = start
    for value in existing_ids:
        try:
            num = int(value.replace(f"{prefix}-", ""))
            max_num = max(max_num, num)
        except ValueError:
            continue
    return f"{prefix}-{max_num + 1}"
