using Dapper;
using System.Data;

namespace Grid_Dapper.Server.Data
{
    /// <summary>
    /// Repository pattern implementation for Reservation using Dapper
    /// Handles CRUD operations for hotel room reservations
    /// </summary>
    public class ReservationRepository
    {
        private readonly IDbConnection _connection;

        // ReservationId configuration (matches samples like RES001001)
        private const string ReservationIdPrefix = "RES";
        private const int ReservationIdStartNumber = 1001;

        public ReservationRepository(IDbConnection connection)
        {
            _connection = connection;
        }

        /// <summary>
        /// Retrieves all reservations ordered by Id descending.
        /// </summary>
        public async Task<List<Reservation>> GetReservationsAsync()
        {
            const string sql = @"SELECT Id, ReservationId, GuestName, GuestEmail, CheckInDate, CheckOutDate,
                                         RoomType, RoomNumber, AmountPerDay, NoOfDays, TotalAmount,
                                         PaymentStatus, ReservationStatus
                                  FROM dbo.Rooms ORDER BY Id DESC";

            var result = await _connection.QueryAsync<Reservation>(sql);
            return result.ToList();
        }

        /// <summary>
        /// Generates the next ReservationId (e.g., RES001002) by reading the current max numeric suffix.
        /// </summary>
        private async Task<string> GenerateReservationIdAsync()
        {
            const string sql = @"
                SELECT MAX(TRY_CAST(SUBSTRING(ReservationId, LEN(@prefix) + 1, 50) AS INT))
                FROM dbo.Rooms
                WHERE ReservationId LIKE @like";

            var maxNumber = await _connection.ExecuteScalarAsync<int?>(sql, new
            {
                prefix = ReservationIdPrefix,
                like   = ReservationIdPrefix + "%"
            });

            int next = (maxNumber ?? (ReservationIdStartNumber - 1)) + 1;
            // Pad to 6 digits to match existing samples like RES001001
            return $"{ReservationIdPrefix}{next:D6}";
        }

        /// <summary>
        /// Inserts a new reservation and returns the created entity with generated Id.
        /// </summary>
        public async Task<Reservation> AddReservationAsync(Reservation value)
        {
            if (value == null) throw new ArgumentNullException(nameof(value));

            if (string.IsNullOrWhiteSpace(value.ReservationId))
                value.ReservationId = await GenerateReservationIdAsync();

            const string sql = @"
                INSERT INTO dbo.Rooms
                    (ReservationId, GuestName, GuestEmail, CheckInDate, CheckOutDate, RoomType, RoomNumber,
                     AmountPerDay, NoOfDays, TotalAmount, PaymentStatus, ReservationStatus)
                OUTPUT INSERTED.Id
                VALUES
                    (@ReservationId, @GuestName, @GuestEmail, @CheckInDate, @CheckOutDate, @RoomType, @RoomNumber,
                     @AmountPerDay, @NoOfDays, @TotalAmount, @PaymentStatus, @ReservationStatus)";

            value.Id = await _connection.ExecuteScalarAsync<int>(sql, value);
            return value;
        }

        /// <summary>
        /// Updates an existing reservation by Id and returns the updated entity.
        /// </summary>
        public async Task<Reservation> UpdateReservationAsync(Reservation value)
        {
            if (value == null) throw new ArgumentNullException(nameof(value));

            const string sql = @"
                UPDATE dbo.Rooms
                   SET ReservationId     = @ReservationId,
                       GuestName         = @GuestName,
                       GuestEmail        = @GuestEmail,
                       CheckInDate       = @CheckInDate,
                       CheckOutDate      = @CheckOutDate,
                       RoomType          = @RoomType,
                       RoomNumber        = @RoomNumber,
                       AmountPerDay      = @AmountPerDay,
                       NoOfDays          = @NoOfDays,
                       TotalAmount       = @TotalAmount,
                       PaymentStatus     = @PaymentStatus,
                       ReservationStatus = @ReservationStatus
                 WHERE Id = @Id";

            await _connection.ExecuteAsync(sql, value);
            return value;
        }

        /// <summary>
        /// Deletes a reservation by Id. Returns the number of affected rows (0 or 1).
        /// </summary>
        public async Task<int> RemoveReservationAsync(int id)
        {
            const string sql = @"DELETE FROM dbo.Rooms WHERE Id = @Id";
            return await _connection.ExecuteAsync(sql, new { Id = id });
        }
    }
}