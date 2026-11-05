"""Tests für die Auslieferung der Dashboard-Karten."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

from homeassistant.core import HomeAssistant

from custom_components.bissfest.frontend import CARD_PATH, CARD_URL, async_register_cards


async def test_register_cards(hass: HomeAssistant) -> None:
    hass.http = MagicMock(async_register_static_paths=AsyncMock())
    with patch("custom_components.bissfest.frontend.add_extra_js_url") as add_js:
        await async_register_cards(hass)

    config = hass.http.async_register_static_paths.call_args.args[0][0]
    assert config.url_path == CARD_URL
    assert CARD_PATH.is_file()
    assert config.path == str(CARD_PATH)
    add_js.assert_called_once_with(hass, f"{CARD_URL}?v=2.2.1")
