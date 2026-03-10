import { useState } from "react";
import { useStockMarket } from "@/hooks/useStockMarket";
import { Stock, SortKey, SortDir, sortStocks } from "@/lib/stockEngine";
import { TopBar } from "@/components/game/TopBar";
import { StockList } from "@/components/game/StockList";
import { ChartPanel } from "@/components/game/ChartPanel";
import { TradingPanel } from "@/components/game/TradingPanel";
import { MarketEvents } from "@/components/game/MarketEvents";
import { GameNav, GameTab } from "@/components/game/GameNav";
import { BankPage } from "@/components/game/BankPage";

const Index = () => {
  const game = useStockMarket();
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("risk");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [activeTab, setActiveTab] = useState<GameTab>("market");

  const handleSelectStock = (stock: Stock) => {
    const latest = game.stocks.find(s => s.id === stock.id);
    setSelectedStock(latest || stock);
  };

  const currentSelected = selectedStock
    ? game.stocks.find(s => s.id === selectedStock.id) || selectedStock
    : null;

  const sortedStocks = sortStocks(game.stocks, sortKey, sortDir);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <TopBar
        cash={game.cash}
        portfolioValue={game.portfolioValue}
        shortsValue={game.shortsValue}
        totalValue={game.totalValue}
        totalPnL={game.totalPnL}
        totalPnLPercent={game.totalPnLPercent}
        dayCount={game.dayCount}
        sentiment={game.sentiment}
        totalDebt={game.totalDebt}
      />

      <GameNav activeTab={activeTab} onTabChange={setActiveTab} debtWarning={game.totalDebt > 0} />

      {activeTab === "market" && (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-80 flex-shrink-0 border-r border-border overflow-y-auto">
            <StockList
              stocks={sortedStocks}
              selectedId={currentSelected?.id || null}
              onSelect={handleSelectStock}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
              portfolio={game.portfolio}
            />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4">
              {currentSelected ? (
                <ChartPanel stock={currentSelected} sentiment={game.sentiment} pumpDump={game.pumpDump} />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <p>Select a stock to view its chart</p>
                </div>
              )}
            </div>
            <div className="h-48 border-t border-border overflow-y-auto p-4">
              <MarketEvents events={game.events} />
            </div>
          </div>

          <div className="w-80 flex-shrink-0 border-l border-border overflow-y-auto">
            <TradingPanel
              stock={currentSelected}
              holding={currentSelected ? game.portfolio.find(p => p.stockId === currentSelected.id) : undefined}
              shortPosition={currentSelected ? game.shorts.find(s => s.stockId === currentSelected.id) : undefined}
              cash={game.cash}
              portfolio={game.portfolio}
              shorts={game.shorts}
              stocks={game.stocks}
              onBuy={game.buyStock}
              onSell={game.sellStock}
              onShort={game.shortStock}
              onCoverShort={game.coverShort}
              onSelectStock={handleSelectStock}
            />
          </div>
        </div>
      )}

      {activeTab === "bank" && (
        <div className="flex-1 overflow-hidden">
          <BankPage cash={game.cash} loans={game.loans} onTakeLoan={game.takeLoan} onRepayLoan={game.repayLoan} />
        </div>
      )}
    </div>
  );
};

export default Index;
