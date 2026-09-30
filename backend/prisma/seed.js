const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const stocks = [
  {
    symbol: "AAPL",
    companyName: "Apple Inc.",
    exchange: "NASDAQ",
    sector: "Technology",
    currentPrice: 226.96,
    previousClose: 224.45,
    dayChange: 2.51,
    dayChangePct: 1.12,
    marketCap: 3400000000000,
    volume: 45200000,
  },
  {
    symbol: "MSFT",
    companyName: "Microsoft Corporation",
    exchange: "NASDAQ",
    sector: "Technology",
    currentPrice: 510.05,
    previousClose: 507.25,
    dayChange: 2.80,
    dayChangePct: 0.55,
    marketCap: 3790000000000,
    volume: 22100000,
  },
  {
    symbol: "NVDA",
    companyName: "NVIDIA Corporation",
    exchange: "NASDAQ",
    sector: "Technology",
    currentPrice: 177.00,
    previousClose: 175.20,
    dayChange: 1.80,
    dayChangePct: 1.03,
    marketCap: 4300000000000,
    volume: 186000000,
  },
  {
    symbol: "AMZN",
    companyName: "Amazon.com Inc.",
    exchange: "NASDAQ",
    sector: "Consumer Cyclical",
    currentPrice: 225.15,
    previousClose: 223.50,
    dayChange: 1.65,
    dayChangePct: 0.74,
    marketCap: 2400000000000,
    volume: 38900000,
  },
  {
    symbol: "TSLA",
    companyName: "Tesla Inc.",
    exchange: "NASDAQ",
    sector: "Automotive",
    currentPrice: 442.80,
    previousClose: 438.25,
    dayChange: 4.55,
    dayChangePct: 1.04,
    marketCap: 1450000000000,
    volume: 98200000,
  },
];

async function main() {
  for (const stock of stocks) {
    await prisma.stock.upsert({
      where: {
        symbol: stock.symbol,
      },
      update: stock,
      create: stock,
    });
  }

  console.log(`Seeded ${stocks.length} stocks.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });