import enum


class UserRole(str, enum.Enum):
    customer = "customer"
    provider = "provider"
    admin = "admin"


class DisputeStatus(str, enum.Enum):
    open = "open"
    under_review = "under_review"
    resolved = "resolved"
    rejected = "rejected"


class ProviderStatus(str, enum.Enum):
    online = "online"
    offline = "offline"
    busy = "busy"
    suspended = "suspended"


class VoiceSupportStatus(str, enum.Enum):
    enabled = "enabled"
    disabled = "disabled"
    maintenance = "maintenance"


class ProviderStatus(str, enum.Enum):
    offline = "offline"
    online = "online"
    busy = "busy"


class RequestStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    on_the_way = "on_the_way"
    arrived = "arrived"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"
    declined = "declined"
    disputed = "disputed"
