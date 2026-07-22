"""
ML Analysis Layer.

IMPORTANT: this module never touches the simulation itself. It only reads
the generation-by-generation history the SimulationEngine has already
produced and fits lightweight models to forecast where resistance is
heading. This keeps "what happens" (engine) cleanly separated from
"what we predict will happen" (ML), as required by the project spec.
"""
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures


MIN_POINTS_FOR_PREDICTION = 4


def _confidence_from_r2(r2):
    # Map R^2 (can be negative for a bad fit) into a 0-100 confidence score
    return int(round(max(0.0, min(1.0, r2)) * 100))


def analyze(history):
    """
    history: list of per-generation snapshot dicts from SimulationEngine.
    Returns a dict describing predicted future resistance trajectory,
    estimated generation of dominance, hotspot risk, antibiotic
    effectiveness, and a plain-language recommendation.
    """
    if len(history) < MIN_POINTS_FOR_PREDICTION:
        return {
            "ready": False,
            "message": "Collecting data — need a few more generations before predictions stabilize.",
        }

    generations = np.array([h["generation"] for h in history]).reshape(-1, 1)
    resistance = np.array([h["avg_resistance"] for h in history])
    population = np.array([h["population"] for h in history])
    hotspots = np.array([h["hotspot_count"] for h in history])

    # Fit a degree-2 polynomial curve to resistance-over-time so the
    # forecast captures acceleration, not just a straight line
    poly = PolynomialFeatures(degree=2)
    X_poly = poly.fit_transform(generations)
    model = LinearRegression().fit(X_poly, resistance)
    r2 = model.score(X_poly, resistance)

    last_gen = int(generations[-1, 0])
    future_gens = np.arange(last_gen + 1, last_gen + 21).reshape(-1, 1)
    future_X = poly.transform(future_gens)
    future_resistance = np.clip(model.predict(future_X), 0, 1)

    # Estimate the generation at which average resistance crosses the
    # "dominant resistant colony" threshold (0.7)
    dominant_gen = None
    for gen, val in zip(future_gens.flatten(), future_resistance):
        if val >= 0.7:
            dominant_gen = int(gen)
            break

    # Population trend (simple linear slope, recent window)
    window = min(10, len(population))
    pop_trend_model = LinearRegression().fit(
        generations[-window:], population[-window:]
    )
    pop_slope = float(pop_trend_model.coef_[0])

    # Antibiotic effectiveness: falling if resistance is rising while
    # antibiotic pressure stays constant
    recent_resistance_slope = float(
        np.polyfit(generations[-window:, 0], resistance[-window:], 1)[0]
    )
    effectiveness = max(0.0, min(1.0, 1.0 - recent_resistance_slope * 5))

    avg_hotspots_recent = float(hotspots[-window:].mean())
    high_risk = avg_hotspots_recent > 2 or recent_resistance_slope > 0.01

    recommendations = []
    if recent_resistance_slope > 0.01:
        recommendations.append("Mutation-driven resistance is accelerating.")
    if dominant_gen:
        recommendations.append(
            f"Resistant colony dominance projected around generation {dominant_gen}."
        )
    if avg_hotspots_recent > 2:
        recommendations.append("Persistent resistance hotspots detected in the grid.")
    if effectiveness < 0.4:
        recommendations.append(
            "Current antibiotic level is losing effectiveness — consider increasing dosage "
            "or switching treatment strategy."
        )
    if not recommendations:
        recommendations.append(
            "Population remains largely susceptible; current antibiotic level appears effective."
        )

    return {
        "ready": True,
        "future_resistance": [round(float(v), 4) for v in future_resistance],
        "future_generations": [int(g) for g in future_gens.flatten()],
        "estimated_dominant_generation": dominant_gen,
        "population_trend": "increasing" if pop_slope > 0 else "decreasing",
        "population_trend_slope": round(pop_slope, 2),
        "high_risk_zone": bool(high_risk),
        "antibiotic_effectiveness": round(effectiveness * 100, 1),
        "confidence_score": _confidence_from_r2(r2),
        "recommendation": " ".join(recommendations),
    }
