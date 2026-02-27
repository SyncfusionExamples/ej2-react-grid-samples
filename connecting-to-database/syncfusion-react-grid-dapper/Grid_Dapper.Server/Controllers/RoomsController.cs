using Microsoft.AspNetCore.Mvc;
using Syncfusion.EJ2.Base;
using Grid_Dapper.Server.Data;
using System.Collections.Generic;
using System.Linq;

namespace Grid_Dapper.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly ReservationRepository _repo;
        private readonly DataOperations _dataOps = new DataOperations();

        public RoomsController(ReservationRepository repo)
        {
            _repo = repo;
        }

        // POST: api/rooms
        [HttpPost]
        public async Task<IActionResult> List([FromBody] DataManagerRequest dm)
        {
            IEnumerable<Reservation> data = await _repo.GetReservationsAsync();

            // Searching
            if (dm.Search != null && dm.Search.Count > 0)
            {
                data = _dataOps.PerformSearching(data, dm.Search);
            }

            // Filtering
            if (dm.Where != null && dm.Where.Count > 0)
            {
                data = _dataOps.PerformFiltering(data, dm.Where, dm.Where[0].Operator);
            }

            // Sorting
            if (dm.Sorted != null && dm.Sorted.Count > 0)
            {
                data = _dataOps.PerformSorting(data, dm.Sorted);
            }

            // Count BEFORE paging
            int count = data.Count();

            // Paging
            if (dm.Skip != 0)
                data = _dataOps.PerformSkip(data, dm.Skip);
            if (dm.Take != 0)
                data = _dataOps.PerformTake(data, dm.Take);

            // Final shape required by UrlAdaptor
            return Ok(dm.RequiresCounts ? new { result = data, count } : data);
        }

        [HttpGet("ping")]
        public IActionResult Ping() => Ok(new { ok = true, time = DateTime.UtcNow });

        // INSERT
        // POST api/rooms/insert
        [HttpPost("insert")]
        public async Task<IActionResult> Insert([FromBody] CRUDModel<Reservation> args)
        {
           if (args?.Value == null)
               return BadRequest("Invalid payload.");
           var created = await _repo.AddReservationAsync(args.Value);
           return Ok(created);
        }

        // UPDATE
        // POST api/rooms/update
        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] CRUDModel<Reservation> args)
        {
           if (args?.Value == null)
               return BadRequest("Invalid payload.");
           if (args.Value.Id <= 0)
               return BadRequest("Id is required for update.");
           var updated = await _repo.UpdateReservationAsync(args.Value);
           return Ok(updated);
        }

        // REMOVE
        // POST api/rooms/remove
        // UrlAdaptor sends { key: <id>, keyColumn: "Id", action: "remove" }
        [HttpPost("remove")]
        public async Task<IActionResult> Remove([FromBody] CRUDModel<Reservation> args)
        {
           if (args == null || args.Key == null)
               return BadRequest("Key is required.");
           if (!int.TryParse(args.Key.ToString(), out var id))
               return BadRequest("Invalid key format.");

           await _repo.RemoveReservationAsync(id);
           return Ok(new { Id = id });
        }

        // BATCH
        // POST api/rooms/batch
        [HttpPost("batch")]
        public async Task<IActionResult> Batch([FromBody] CRUDModel<Reservation> args)
        {
           if (args == null)
               return BadRequest("Invalid payload.");

           if (args.Changed != null)
           {
               foreach (var t in args.Changed)
                   await _repo.UpdateReservationAsync(t);
           }

           if (args.Added != null)
           {
               for (int i = 0; i < args.Added.Count; i++)
                   args.Added[i] = await _repo.AddReservationAsync(args.Added[i]);
           }

           if (args.Deleted != null)
           {
               foreach (var t in args.Deleted)
                   await _repo.RemoveReservationAsync(t.Id);
           }

           return Ok(new { status = "ok" });
        }
    }
}
