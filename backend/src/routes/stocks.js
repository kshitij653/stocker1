const express = require("express");

const prisma = require("../prisma");

const router = express.Router();

// Search stocks
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const stocks = await prisma.stock.findMany({
      where: {
        OR: [
          {
            symbol: {
              contains: query,
            },
          },
          {
            companyName: {
              contains: query,
            },
          },
        ],
      },
      orderBy: {
        symbol: "asc",
      },
    });

    res.json({
      success: true,
      count: stocks.length,
      stocks,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to search stocks",
    });
  }
});

// Get all stocks
router.get("/", async (req, res) => {
  try {
    const stocks = await prisma.stock.findMany({
      orderBy: {
        symbol: "asc",
      },
    });

    res.json({
      success: true,
      count: stocks.length,
      stocks,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch stocks",
    });
  }
});

// Get one stock by symbol
router.get("/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const stock = await prisma.stock.findUnique({
      where: {
        symbol,
      },
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found",
      });
    }

    res.json({
      success: true,
      stock,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch stock",
    });
  }
});

module.exports = router;