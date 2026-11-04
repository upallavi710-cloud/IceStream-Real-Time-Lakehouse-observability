
import json
import random
import uuid
from datetime import datetime, timezone


def generate_transaction():
    transaction = {
        "transaction_id": str(uuid.uuid4()),
        "order_id": random.randint(10000, 99999),
        "customer_id": random.randint(1000, 9999),
        "product_id": random.randint(100, 999),
        "quantity": random.randint(1, 5),
        "amount": round(random.uniform(100, 5000), 2),
        "payment_method": random.choice(
            ["UPI", "Credit Card", "Debit Card", "Cash"]
        ),
        "status": random.choice(
            ["SUCCESS", "PENDING", "FAILED"]
        ),
        "event_time": datetime.now(timezone.utc).isoformat()
    }

    # Inject occasional null values
    if random.random() < 0.01:
        transaction["amount"] = None

    # Inject occasional schema changes
    if random.random() < 0.02:
        transaction["coupon_code"] = random.choice(
            ["SAVE10", "NEWUSER", "FESTIVE"]
        )

    return transaction

if __name__ == "__main__":
    total_transactions = 10000

    for _ in range(total_transactions):
        transaction = generate_transaction()
        print(json.dumps(transaction))