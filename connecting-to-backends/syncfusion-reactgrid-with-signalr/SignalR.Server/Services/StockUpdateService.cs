using Microsoft.AspNetCore.SignalR;
using SignalR.Server.Hubs;
using SignalR.Server.Models;

namespace SignalR.Server.Services
{
    /// <summary>
    /// Background service to simulate and broadcast stock price updates
    /// </summary>
    public class StockUpdateService : BackgroundService
    {
        private readonly IHubContext<StockHub> _hubContext;
        private readonly ILogger<StockUpdateService> _logger;
        private readonly Random _random = new Random();

        public StockUpdateService(IHubContext<StockHub> hubContext, ILogger<StockUpdateService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Stock Update Service is starting.");

            // Initialize stocks
            Stock.GetAllStocks();

            try
            {
                while (!stoppingToken.IsCancellationRequested)
                {
                    // Update stock prices
                    UpdateStockPrices();

                    // Broadcast updated stocks to all clients in the StockTraders group
                    await _hubContext.Clients.Group("StockTraders").SendAsync("ReceiveStockUpdate", Stock.Stocks);

                    _logger.LogInformation($"Stock prices updated at {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}");

                    // Wait for 2 seconds before next update
                    await Task.Delay(2000, stoppingToken);
                }
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Stock Update Service is stopping.");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in Stock Update Service: {ex.Message}");
            }
        }

        /// <summary>
        /// Update stock prices with random fluctuations
        /// </summary>
        private void UpdateStockPrices()
        {
            foreach (var stock in Stock.Stocks)
            {
                stock.PreviousPrice = stock.CurrentPrice;

                // Generate random price change between -2% and +2%
                decimal changePercent = (decimal)(_random.NextDouble() * 4 - 2); // -2 to +2
                decimal priceChange = stock.CurrentPrice * (changePercent / 100);
                stock.CurrentPrice = Math.Max(stock.CurrentPrice + priceChange, 0.01m); // Ensure price stays positive

                // Calculate change and change percent
                stock.Change = stock.CurrentPrice - stock.PreviousPrice;
                stock.ChangePercent = stock.PreviousPrice > 0 ? (stock.Change / stock.PreviousPrice) * 100 : 0;

                // Update volume randomly
                stock.Volume = stock.Volume + (long)(_random.Next(-5000000, 5000000));
                stock.Volume = Math.Max(stock.Volume, 1000000); // Ensure volume is positive

                // Update timestamp
                stock.LastUpdated = DateTime.UtcNow;

                // Update display values for UI rendering
                stock.UpdateDisplayValues();
            }
        }
    }
}
