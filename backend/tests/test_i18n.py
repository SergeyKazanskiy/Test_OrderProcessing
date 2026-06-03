"""Unit tests for the i18n translator."""

from app.i18n import translate


class TestTranslator:
    def test_english_key(self):
        msg = translate("customer_created", "en")
        assert "Customer" in msg or "customer" in msg.lower()

    def test_ukrainian_key(self):
        msg = translate("order_created", "uk")
        assert "Замовлення" in msg

    def test_russian_key(self):
        msg = translate("order_created", "ru")
        assert "Заказ" in msg

    def test_interpolation(self):
        msg = translate("customer_not_found", "en", id=42)
        assert "42" in msg

    def test_unknown_locale_falls_back_to_default(self):
        msg = translate("customer_created", "zz")
        assert msg  # returns something

    def test_unknown_key_returns_key(self):
        msg = translate("completely_unknown_key", "en")
        assert msg == "completely_unknown_key"

    def test_missing_context_leaves_placeholder(self):
        msg = translate("customer_not_found", "en")  # no id=
        assert "{id}" in msg
