const express = require("express");

const prisma = require("../prisma");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Get user's portfolio
router.get("/", authenticateToken, async (req, res) => {
  try {
    const holdings = await prisma.holding.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        stock: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const portfolio = holdings.map((holding) => {
      const currentPrice = holding.stock.currentPrice || 0;
      const currentValue = holding.quantity * currentPrice;
      const investedValue = holding.quantity * holding.averagePrice;
      const profitLoss = currentValue - investedValue;
      const profitLossPct =
        investedValue > 0 ? (profitLoss / investedValue) * 100 : 0;

      return {
        ...holding,
        currentValue,
        investedValue,
        profitLoss,
        profitLossPct,
      };
    });

    const totalInvested = portfolio.reduce(
      (sum, holding) => sum + holding.investedValue,
      0
    );

    const totalCurrentValue = portfolio.reduce(
      (sum, holding) => sum + holding.currentValue,
      0
    );

    const totalProfitLoss = totalCurrentValue - totalInvested;

    const totalProfitLossPct =
      totalInvested > 0
        ? (totalProfitLoss / totalInvested) * 100
        : 0;

    res.json({
      success: true,
      summary: {
        totalInvested,
        totalCurrentValue,
        totalProfitLoss,
        totalProfitLossPct,
      },
      holdings: portfolio,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch portfolio",
    });
  }
});

// Add or update a holding
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { symbol, quantity, averagePrice } = req.body;

    if (!symbol || quantity === undefined || averagePrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "Symbol, quantity and average price are required",
      });
    }

    if (Number(quantity) <= 0 || Number(averagePrice) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity and average price must be greater than zero",
      });
    }

    const stock = await prisma.stock.findUnique({
      where: {
        symbol: symbol.toUpperCase(),
      },
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found",
      });
    }

    const holding = await prisma.holding.upsert({
      where: {
        userId_stockId: {
          userId: req.user.userId,
          stockId: stock.id,
        },
      },
      update: {
        quantity: Number(quantity),
        averagePrice: Number(averagePrice),
      },
      create: {
        userId: req.user.userId,
        stockId: stock.id,
        quantity: Number(quantity),
        averagePrice: Number(averagePrice),
      },
      include: {
        stock: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Holding saved successfully",
      holding,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to save holding",
    });
  }
});

// Delete a holding
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const holding = await prisma.holding.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: "Holding not found",
      });
    }

    await prisma.holding.delete({
      where: {
        id: holding.id,
      },
    });

    res.json({
      success: true,
      message: "Holding deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete holding",
    });
  }
});

module.exports = router;