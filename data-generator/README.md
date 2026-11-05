# Transaction Data Generator

This module generates mock e-commerce transaction data
for the IceStream Real-Time Lakehouse Observability project.

## Features

- Generates 10,000 mock transactions.
- Creates unique transaction IDs.
- Generates random customer and product details.
- Supports multiple payment methods and order statuses.
- Injects occasional null values in the amount field.
- Introduces schema changes using an additional coupon_code field.

## Technology

- Python 3.12
- JSON
- UUID
- Random

## Run the Generator

From the project root directory:

```bash
python data-generator/generate_transactions.py