using SignalR.Server.Models;

namespace SignalR.Server.Services
{
    public class StockDataService
    {
        public List<Stock> GetAllStocks()
        {
            return Stock.GetAllStocks();
        }
    }
}
