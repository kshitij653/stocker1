const express = require("express");

const prisma = require("../prisma");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Get user's alerts
router.get("/", authenticateToken, async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        stock: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch alerts",
    });
  }
});

// Create a price alert
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { symbol, type, targetPrice } = req.body;

    if (!symbol || !type || targetPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "Symbol, type and target price are required",
      });
    }

    const alertType = type.toUpperCase();

    if (!["ABOVE", "BELOW"].includes(alertType)) {
      return res.status(400).json({
        success: false,
        message: "Alert type must be ABOVE or BELOW",
      });
    }

    if (Number(targetPrice) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Target price must be greater than zero",
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

    const alert = await prisma.alert.create({
      data: {
        userId: req.user.userId,
        stockId: stock.id,
        type: alertType,
        targetPrice: Number(targetPrice),
      },
      include: {
        stock: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Price alert created successfully",
      alert,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create alert",
    });
  }
});

// Delete an alert
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const alert = await prisma.alert.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    await prisma.alert.delete({
      where: {
        id: alert.id,
      },
    });

    res.json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete alert",
    });
  }
});

module.exports = router;