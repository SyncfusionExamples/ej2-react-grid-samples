using System;
using System.Collections.Generic;
using System.Linq;
using SignalR.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Syncfusion.EJ2.Base;
using System.Collections;

namespace SignalR.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StockController : ControllerBase
    {
        /// <summary>
        /// Fetch stock data with support for Syncfusion DataManager operations
        /// Supports: Search, Sorting, Filtering, Paging
        /// </summary>
        [HttpPost("UrlDatasource")]
        public IActionResult UrlDatasource([FromBody] DataManagerRequest dm)
        {
            try
            {
                // Get all stocks from the static collection
                IEnumerable DataSource = Stock.GetAllStocks().ToList();
                DataOperations operation = new DataOperations();

                // Search operation
                if (dm.Search != null && dm.Search.Count > 0)
                {
                    DataSource = operation.PerformSearching(DataSource, dm.Search);
                }

                // Sorting operation
                if (dm.Sorted != null && dm.Sorted.Count > 0)
                {
                    DataSource = operation.PerformSorting(DataSource, dm.Sorted);
                }

                // Filtering operation
                if (dm.Where != null && dm.Where.Count > 0)
                {
                    DataSource = operation.PerformFiltering(DataSource, dm.Where, dm.Where[0].Operator);
                }

                // Get total count before paging
                int count = DataSource.Cast<Stock>().Count();

                // Paging operations
                if (dm.Skip != 0)
                {
                    DataSource = operation.PerformSkip(DataSource, dm.Skip);
                }

                if (dm.Take != 0)
                {
                    DataSource = operation.PerformTake(DataSource, dm.Take);
                }

                // Return result with count if required
                return dm.RequiresCounts 
                    ? Ok(new { result = DataSource, count = count }) 
                    : Ok(DataSource);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Get all stocks 
        /// </summary>
        [HttpGet("GetAll")]
        public IActionResult GetAll()
        {
            try
            {
                var stocks = Stock.GetAllStocks();
                return Ok(stocks);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Get a single stock by StockId
        /// </summary>
        [HttpGet("GetById/{id}")]
        public IActionResult GetById(int id)
        {
            try
            {
                var stock = Stock.GetAllStocks().FirstOrDefault(s => s.StockId == id);
                if (stock == null)
                {
                    return NotFound(new { error = $"Stock with ID {id} not found" });
                }
                return Ok(stock);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Get stocks by symbol (e.g., "AAPL")
        /// </summary>
        [HttpGet("GetBySymbol/{symbol}")]
        public IActionResult GetBySymbol(string symbol)
        {
            try
            {
                var stock = Stock.GetAllStocks()
                    .FirstOrDefault(s => s.Symbol.Equals(symbol, StringComparison.OrdinalIgnoreCase));
                
                if (stock == null)
                {
                    return NotFound(new { error = $"Stock with symbol {symbol} not found" });
                }
                return Ok(stock);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        
       
        /// <summary>
        /// Get stock statistics (min, max, average price, etc.)
        /// </summary>
        [HttpGet("GetStatistics")]
        public IActionResult GetStatistics()
        {
            try
            {
                var stocks = Stock.GetAllStocks();

                if (stocks.Count == 0)
                {
                    return NotFound(new { error = "No stocks available" });
                }

                var stats = new
                {
                    totalStocks = stocks.Count,
                    minPrice = stocks.Min(s => s.CurrentPrice),
                    maxPrice = stocks.Max(s => s.CurrentPrice),
                    averagePrice = stocks.Average(s => s.CurrentPrice),
                    positiveChanges = stocks.Count(s => s.Change > 0),
                    negativeChanges = stocks.Count(s => s.Change < 0),
                    totalVolume = stocks.Sum(s => s.Volume),
                    averageChangePercent = stocks.Average(s => s.ChangePercent),
                    lastUpdated = DateTime.UtcNow
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }

    /// <summary>
    /// CRUD Model for handling Syncfusion DataManager CRUD operations
    /// </summary>
    public class CRUDModel<T> where T : class
    {
        public string? action { get; set; }
        public string? table { get; set; }
        public string? keyColumn { get; set; }
        public object? key { get; set; }
        public T? value { get; set; }
        public List<T>? added { get; set; }
        public List<T>? changed { get; set; }
        public List<T>? deleted { get; set; }
        public IDictionary<string, object>? @params { get; set; }
    }

    /// <summary>
    /// Where clause model for filtering operations
    /// </summary>
    public class Wheres
    {
        public List<Predicates>? predicates { get; set; }
        public string? field { get; set; }
        public bool ignoreCase { get; set; }
        public bool isComplex { get; set; }
        public string? value { get; set; }
        public string? Operator { get; set; }
    }

    /// <summary>
    /// Predicates model for complex filtering
    /// </summary>
    public class Predicates
    {
        public string? value { get; set; }
        public string? field { get; set; }
        public bool isComplex { get; set; }
        public bool ignoreCase { get; set; }
        public string? Operator { get; set; }
    }
}
