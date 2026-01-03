import "../index.css";

export default function OrderTimeline({ status }) {
    const statuses = [
        { key: "placed", label: "Placed" },
        { key: "out_for_delivery", label: "Out for Delivery" },
        { key: "delivered", label: "Delivered" }
    ];

    const currentIndex = statuses.findIndex(s => s.key === status);

    return (
        <div className="order-timeline">
            {statuses.map((s, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                    <div key={s.key} className="timeline-step">
                        <div
                            className={`timeline-dot ${isCompleted ? "completed" : ""
                                } ${isCurrent ? "current" : ""
                                }`}
                        >
                            {isCompleted && "✓"}
                        </div>
                        <div className="timeline-label">{s.label}</div>
                        {index < statuses.length - 1 && (
                            <div
                                className={`timeline-line ${isCompleted ? "completed" : ""
                                    }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
