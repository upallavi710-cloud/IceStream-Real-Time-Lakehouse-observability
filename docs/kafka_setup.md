# IceStream - Kafka Setup and Event Streaming

## 1. Overview

Apache Kafka is used as the message streaming platform in IceStream. The Python producer reads events from the generated JSONL dataset and publishes them to a Kafka topic.

## 2. Environment

- Apache Kafka: 4.4.0
- Python: 3.12
- Kafka mode: KRaft
- Kafka broker: localhost:9092
- Topic: icestream-events
- Python library: kafka-python

## 3. Kafka Topic Creation

Create the topic:

    kafka-topics.bat --create --topic icestream-events --bootstrap-server localhost:9092

Verify the topic:

    kafka-topics.bat --list --bootstrap-server localhost:9092

## 4. Python Producer

Producer file: `kafka/producer.py`

Input file: `data-generator/events.jsonl`

Install the dependency:

    python -m pip install kafka-python

Run the producer from the project root:

    python kafka/producer.py

## 5. Event Publishing

Successfully published 10,000 events to the `icestream-events` topic.

## 6. Consumer Verification

Used the Kafka console consumer to retrieve and inspect five messages successfully.

## 7. Pipeline Progress

CSV Dataset -> Python Producer -> Kafka Topic
Next integration stage: Apache Flink stream processing.