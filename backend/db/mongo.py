"""
MongoDB Atlas connection layer.

Per project spec: MongoDB stores EXPERIMENT-LEVEL data only
(experiments, snapshots, reports, predictions, metadata) — never
per-bacterium records, which live only in server memory during a run.
"""
import datetime
from pymongo import MongoClient

from config import Config


class MongoStore:
    def __init__(self):
        self.client = None
        self.db = None
        self.connected = False
        self._connect()

    def _connect(self):
        try:
            self.client = MongoClient(
                Config.MONGO_URI, serverSelectionTimeoutMS=3000
            )
            self.client.admin.command("ping")
            self.db = self.client[Config.MONGO_DB_NAME]
            self.connected = True
            print("[MongoStore] Connected to MongoDB Atlas.")
        except Exception as e:
            self.connected = False
            if Config.MONGO_OPTIONAL:
                print(
                    "[MongoStore] WARNING: could not connect to MongoDB. "
                    "Running with in-memory fallback only. "
                    f"({e})"
                )
            else:
                raise

    # ---- Fallback in-memory store, used when Atlas is unreachable ----
    _memory = {
        "experiments": {},
        "snapshots": {},
        "reports": {},
    }

    def save_experiment(self, experiment_id, metadata):
        metadata["updated_at"] = datetime.datetime.utcnow()
        if self.connected:
            self.db.experiments.update_one(
                {"_id": experiment_id}, {"$set": metadata}, upsert=True
            )
        else:
            self._memory["experiments"][experiment_id] = metadata

    def save_snapshot(self, experiment_id, snapshot):
        snapshot["experiment_id"] = experiment_id
        snapshot["timestamp"] = datetime.datetime.utcnow()
        if self.connected:
            self.db.snapshots.insert_one(snapshot)
        else:
            self._memory["snapshots"].setdefault(experiment_id, []).append(snapshot)

    def save_report(self, experiment_id, report):
        report["experiment_id"] = experiment_id
        report["created_at"] = datetime.datetime.utcnow()
        if self.connected:
            self.db.reports.insert_one(report)
        else:
            self._memory["reports"][experiment_id] = report

    def get_history(self, experiment_id):
        if self.connected:
            return list(
                self.db.snapshots.find(
                    {"experiment_id": experiment_id}, {"_id": 0}
                ).sort("timestamp", 1)
            )
        return self._memory["snapshots"].get(experiment_id, [])

    def get_experiment(self, experiment_id):
        if self.connected:
            return self.db.experiments.find_one({"_id": experiment_id}, {"_id": 0})
        return self._memory["experiments"].get(experiment_id)


mongo_store = MongoStore()
