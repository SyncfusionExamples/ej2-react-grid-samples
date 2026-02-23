using Grid_EntityFramework.Server.Data;
using Grid_EntityFramework.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Syncfusion.EJ2.Base;

namespace Grid_EntityFramework.Server.Controllers
{
    [Route("api/[controller]")]
    public class TicketsController : ControllerBase
    {
        private readonly TicketsDbContext _db;

        public TicketsController(TicketsDbContext db)
        {
            _db = db;
        }

        // READ
        [HttpPost("url")]
        public IActionResult UrlDataSource([FromBody] DataManagerRequest dm)
        {
            IQueryable<Ticket> query = _db.Tickets.AsNoTracking();
            var op = new DataOperations();

            if (dm.Search?.Count > 0)
                query = op.PerformSearching(query, dm.Search).Cast<Ticket>().AsQueryable();

            if (dm.Where?.Count > 0)
                query = op.PerformFiltering(query, dm.Where, dm.Where[0].Operator)
                    .Cast<Ticket>()
                    .AsQueryable();

            if (dm.Sorted?.Count > 0)
                query = op.PerformSorting(query, dm.Sorted).Cast<Ticket>().AsQueryable();
            else
                query = query.OrderBy(t => t.TicketId);

            var count = query.Count();

            if (dm.Skip > 0)
                query = query.Skip(dm.Skip);

            if (dm.Take > 0)
                query = query.Take(dm.Take);

            return dm.RequiresCounts
                ? Ok(new { result = query.ToList(), count })
                : Ok(query.ToList());
        }

        // CREATE
        [HttpPost("insert")]
        public IActionResult Insert([FromBody] CRUDModel<Ticket> value)
        {
            var ticket = value.Value;

            // Identity handled like MVC
            ticket.TicketId = 0;

            _db.Tickets.Add(ticket);
            _db.SaveChanges();

            return Ok(ticket);
        }

        // UPDATE
        [HttpPost("update")]
        public IActionResult Update([FromBody] CRUDModel<Ticket> value)
        {
            var ticket = value.Value;

            _db.Entry(ticket).State = EntityState.Modified;
            _db.SaveChanges();

            return Ok(ticket);
        }

        // DELETE
        [HttpPost("remove")]
        public IActionResult Remove([FromBody] CRUDModel<Ticket> value)
        {
            var key = Convert.ToInt32(value.Key);
            var ticket = _db.Tickets.First(t => t.TicketId == key);

            _db.Tickets.Remove(ticket);
            _db.SaveChanges();

            return Ok(value);
        }

        // BATCH
        [HttpPost("batch")]
        public IActionResult Batch([FromBody] CRUDModel<Ticket> value)
        {
            if (value.Changed != null)
            {
                foreach (var ticket in value.Changed)
                {
                    _db.Tickets.Attach(ticket);
                    _db.Entry(ticket).State = EntityState.Modified;
                }
            }

            if (value.Added != null)
            {
                foreach (var ticket in value.Added)
                {
                    ticket.TicketId = 0;
                    _db.Tickets.Add(ticket);
                }
            }

            if (value.Deleted != null)
            {
                foreach (var ticket in value.Deleted)
                {
                    var existing = _db.Tickets.Find(ticket.TicketId);
                    if (existing != null)
                        _db.Tickets.Remove(existing);
                }
            }

            _db.SaveChanges();
            return Ok(value);
        }
    }
}
