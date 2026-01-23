import json
from sqlalchemy.orm import Session
from models.history import History


def save_history(
    db: Session,
    user_id: int,
    image_path: str,
    prediction: str,
    probabilities: dict,
    tag: str | None = None,
    model_version: str = "EfficientNet-B0-v1",
):
    record = History(
        user_id=user_id,
        image_path=image_path,
        prediction=prediction,
        probabilities=json.dumps(probabilities),
        tag=tag,
        model_version=model_version,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record
