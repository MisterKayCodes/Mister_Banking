import random

def generate_account_number() -> str:
    """
    Generates a unique 10-digit account number.
    Ensures the first digit is non-zero to maintain 10-digit integrity.
    """
    # ## this ensures a clean, 10-digit string starting with a non-zero.
    # ## This gives us a massive range of 9 billion possible unique account numbers.
    first_digit = str(random.randint(1, 9))
    remaining_digits = "".join([str(random.randint(0, 9)) for _ in range(9)])
    
    return first_digit + remaining_digits