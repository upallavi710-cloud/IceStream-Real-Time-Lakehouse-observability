import json
from pathlib import Path
from kafka import KafkaProducer
from kafka.errors import KafkaError

# Kafka configuration
KAFKA_SERVER = "localhost:9092"
TOPIC_NAME = "icestream-events"

# Dataset file
DATA_FILE = (
    Path(__file__).parent.parent
    / "data-generator"
    / "events.jsonl"
)


def create_producer():
    return KafkaProducer(
        bootstrap_servers=KAFKA_SERVER,
        value_serializer=lambda value: json.dumps(value).encode("utf-8"),
        retries=3
    )


def publish_events():
    producer = create_producer()

    try:
        with open(DATA_FILE, "r", encoding="utf-8") as file:
            for line_number, line in enumerate(file, start=1):
                event = json.loads(line)

                producer.send(
                    TOPIC_NAME,
                    value=event
                )

                if line_number % 1000 == 0:
                    print(f"Published {line_number} events")

        producer.flush()
        print("All events published successfully!")

    except (OSError, json.JSONDecodeError, KafkaError) as error:
        print(f"Error publishing events: {error}")

    finally:
        producer.close()


if __name__ == "__main__":
    publish_events()