
from pathlib import Path
from pyiceberg.catalog import load_catalog

PROJECT_ROOT = Path(__file__).resolve().parents[2]
WAREHOUSE_PATH = PROJECT_ROOT / "iceberg_warehouse"
CATALOG_DB = PROJECT_ROOT / "iceberg_catalog.db"

WAREHOUSE_PATH.mkdir(parents=True, exist_ok=True)

NAMESPACE = "icestream"


def get_catalog():
    return load_catalog(
        "local",
        **{
            "type": "sql",
            "uri": f"sqlite:///{CATALOG_DB.as_posix()}",
            "warehouse": WAREHOUSE_PATH.as_uri(),
        },
    )


def setup_namespace():
    catalog = get_catalog()

    if (NAMESPACE,) not in catalog.list_namespaces():
        catalog.create_namespace(NAMESPACE)
        print("Created namespace:", NAMESPACE)
    else:
        print("Namespace already exists:", NAMESPACE)

    print("Available namespaces:", catalog.list_namespaces())


if __name__ == "__main__":
    setup_namespace()
