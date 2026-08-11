using Microsoft.AspNetCore.SignalR;
using SignalR.Server.Models;
using SignalR.Server.Services;

namespace SignalR.Server.Hubs
{
    public class StockHub : Hub
    {
        private readonly StockDataService _stockDataService;

        public StockHub(StockDataService stockDataService)
        {
            _stockDataService = stockDataService;
        }

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
            var stocks = _stockDataService.GetAllStocks();
            await Clients.Client(Context.ConnectionId).SendAsync("InitializeStocks", stocks);
        }

        public async Task SubscribeToStocks()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "StockTraders");
            var stocks = _stockDataService.GetAllStocks();
            await Clients.Caller.SendAsync("InitializeStocks", stocks);
        }

        public async Task UnsubscribeFromStocks()
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "StockTraders");
        }
    }
}


