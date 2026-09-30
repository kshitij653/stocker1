const express = require("express");

const prisma = require("../prisma");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Create a watchlist
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Watchlist name is required",
      });
    }

    const watchlist = await prisma.watchlist.create({
      data: {
        name: name.trim(),
        userId: req.user.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Watchlist created successfully",
      watchlist,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "You already have a watchlist with this name",
      });
    }

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create watchlist",
    });
  }
});

// Get user's watchlists
router.get("/", authenticateToken, async (req, res) => {
  try {
    const watchlists = await prisma.watchlist.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        items: {
          include: {
            stock: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json({
      success: true,
      count: watchlists.length,
      watchlists,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch watchlists",
    });
  }
});

// Add a stock to a watchlist
router.post("/:id/stocks", authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: "Stock symbol is required",
      });
    }

    const watchlist = await prisma.watchlist.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!watchlist) {
      return res.status(404).json({
        success: false,
        message: "Watchlist not found",
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

    const item = await prisma.watchlistItem.create({
      data: {
        watchlistId: watchlist.id,
        stockId: stock.id,
      },
      include: {
        stock: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Stock added to watchlist",
      item,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Stock is already in this watchlist",
      });
    }

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to add stock to watchlist",
    });
  }
});

// Remove a stock from a watchlist
router.delete("/:id/stocks/:stockId", authenticateToken, async (req, res) => {
  try {
    const watchlist = await prisma.watchlist.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!watchlist) {
      return res.status(404).json({
        success: false,
        message: "Watchlist not found",
      });
    }

    const item = await prisma.watchlistItem.findFirst({
      where: {
        watchlistId: watchlist.id,
        stockId: req.params.stockId,
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Stock is not in this watchlist",
      });
    }

    await prisma.watchlistItem.delete({
      where: {
        id: item.id,
      },
    });

    res.json({
      success: true,
      message: "Stock removed from watchlist",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to remove stock from watchlist",
    });
  }
});

module.exports = router;