# library/views.py
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters

from .models import BookLending
from .serializers import BookLendingSerializer

class DateInFilter(filters.BaseInFilter, filters.DateFilter):
    """Accepts CSV dates -> applies <field>__in for DateField."""
    pass

class BookLendingFilterSet(filters.FilterSet):
    borrowed_date__in = DateInFilter(field_name='borrowed_date', lookup_expr='in')
    expected_return_date__in = DateInFilter(field_name='expected_return_date', lookup_expr='in')
    actual_return_date__in = DateInFilter(field_name='actual_return_date', lookup_expr='in')

    class Meta:
        model = BookLending
        fields = {
            "record_id": ["exact", "in"],
            "book_title": ["exact", "in", "icontains", "istartswith", "iendswith"],
            "isbn_number": ["exact", "in", "icontains", "istartswith", "iendswith"],
            "author_name": ["exact", "in", "icontains", "istartswith", "iendswith"],
            "genre": ["exact", "in", "icontains", "istartswith", "iendswith"],
            "borrower_name": ["exact", "in", "icontains", "istartswith", "iendswith"],
            "borrower_email": ["exact", "in", "icontains", "istartswith", "iendswith"],
            "borrowed_date": ["exact", "gt", "gte", "lt", "lte"],
            "expected_return_date": ["exact", "gt", "gte", "lt", "lte"],
            "actual_return_date": ["exact", "gt", "gte", "lt", "lte"],
            "lending_status": ["exact", "in", "icontains", "istartswith", "iendswith"],
        }

class BookLendingViewSet(viewsets.ModelViewSet):
    """
    REST ViewSet for BookLending with standard DRF request/response formats.
    """
    
    queryset = BookLending.objects.all()
    serializer_class = BookLendingSerializer

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = BookLendingFilterSet

    search_fields = [
        "record_id",
        "isbn_number",
        "book_title",
        "author_name",
        "genre",
        "borrower_name",
        "borrower_email",
        "lending_status",
    ]

    def list(self, request, *args, **kwargs):
        """Return paginated list: { result, count } honoring page/page_size."""
        queryset = self.filter_queryset(self.get_queryset())

        page = int(request.query_params.get("page"))
        page_size = int(request.query_params.get("page_size"))

        total = queryset.count()
        offset = (page - 1) * page_size
        serializer = self.get_serializer(queryset[offset: offset + page_size], many=True)
        return Response({ "result": serializer.data, "count": total })

    def create(self, request, *args, **kwargs):
        """Create a new lending record and return the created object."""
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Update a lending record and return the updated object."""
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete a lending record and return 204 No Content."""
        return super().destroy(request, *args, **kwargs)
