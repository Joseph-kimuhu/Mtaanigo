from sqlalchemy.orm import Session
from app.models.models import SystemSetting


DEFAULT_COMMISSION_RATE = 10.0  # percent, matches documented KES 1500 -> KES 150 example


def get_commission_rate(db: Session) -> float:
    setting = db.query(SystemSetting).filter(SystemSetting.key == "commission_rate").first()
    if not setting or setting.value in (None, ""):
        return DEFAULT_COMMISSION_RATE
    try:
        return float(setting.value)
    except (TypeError, ValueError):
        return DEFAULT_COMMISSION_RATE


def compute_commission(amount: float, rate: float) -> float:
    return round(amount * (rate / 100.0), 2)
