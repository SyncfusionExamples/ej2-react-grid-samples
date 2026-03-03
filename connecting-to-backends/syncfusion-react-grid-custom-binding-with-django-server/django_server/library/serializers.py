
from rest_framework import serializers
from .models import BookLending


class ZuluDateField(serializers.DateField):
    """Date field serialized as YYYY-MM-DDT00:00:00Z."""

    def to_representation(self, value):
        if value is None:
            return None
        return f"{value:%Y-%m-%d}T00:00:00Z"


class BookLendingSerializer(serializers.ModelSerializer):
    """Serializer for BookLending records."""

    borrowed_date = ZuluDateField()
    expected_return_date = ZuluDateField()
    actual_return_date = ZuluDateField(allow_null=True, required=False)

    class Meta:
        model = BookLending
        fields = "__all__"
