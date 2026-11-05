"""Dashboard-Karten ausliefern: JS-Datei bereitstellen und im Frontend laden."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from .const import DOMAIN

CARD_URL = "/bissfest/bissfest-card.js"
CARD_PATH = Path(__file__).parent / "www" / "bissfest-card.js"


async def async_register_cards(hass: HomeAssistant) -> None:
    """Karten laden, ohne dass eine Dashboard-Ressource angelegt werden muss."""
    integration = await async_get_integration(hass, DOMAIN)
    await hass.http.async_register_static_paths(
        [StaticPathConfig(CARD_URL, str(CARD_PATH), cache_headers=False)]
    )
    # Version in der URL, damit Browser nach einem Update nicht die alte Datei behalten
    add_extra_js_url(hass, f"{CARD_URL}?v={integration.version}")
