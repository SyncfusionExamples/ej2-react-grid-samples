// File: Grid_MySQL.Server/Data/AppDataConnection.cs
using Grid_MySQL.Server.Models;
using LinqToDB;
using LinqToDB.Data;
using LinqToDB.DataProvider.MySql;

namespace Grid_MySQL.Server.Data
{
    public sealed class AppDataConnection : DataConnection
    {
        public AppDataConnection(IConfiguration config)
            : base(
                new DataOptions().UseMySql(
                    config.GetConnectionString("MySqlConn"),
                    MySqlVersion.MySql80,
                    MySqlProvider.MySqlConnector
                )
            )
        {
            InlineParameters = true;
            // Optional tracing:
            // this.OnTrace = info => System.Diagnostics.Debug.WriteLine($"[LinqToDB] {info.SqlText}");
        }

        public ITable<Transaction> Transactions => this.GetTable<Transaction>();
    }
}
