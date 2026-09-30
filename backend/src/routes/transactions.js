const express = require("express");
const prisma = require("../prisma");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Get user's transaction history
router.get("/", authenticateToken, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        stock: true,
      },
      orderBy: {
        executedAt: "desc",
      },
    });

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
    });
  }
});

// Create BUY or SELL transaction and update holding
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { symbol, type, quantity, price } = req.body;

    if (!symbol || !type || quantity === undefined || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Symbol, type, quantity and price are required",
      });
    }

    const transactionType = type.toUpperCase();
    const tradeQuantity = Number(quantity);
    const tradePrice = Number(price);

    if (!["BUY", "SELL"].includes(transactionType)) {
      return res.status(400).json({
        success: false,
        message: "Transaction type must be BUY or SELL",
      });
    }

    if (tradeQuantity <= 0 || tradePrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity and price must be greater than zero",
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

    const totalAmount = tradeQuantity * tradePrice;

    const result = await prisma.$transaction(async (tx) => {
      const existingHolding = await tx.holding.findUnique({
        where: {
          userId_stockId: {
            userId: req.user.userId,
            stockId: stock.id,
          },
        },
      });

      // BUY
      if (transactionType === "BUY") {
        if (existingHolding) {
          const oldQuantity = existingHolding.quantity;
          const oldAveragePrice = existingHolding.averagePrice;

          const newQuantity = oldQuantity + tradeQuantity;

          const newAveragePrice =
            (oldQuantity * oldAveragePrice +
              tradeQuantity * tradePrice) /
            newQuantity;

          await tx.holding.update({
            where: {
              id: existingHolding.id,
            },
            data: {
              quantity: newQuantity,
              averagePrice: newAveragePrice,
            },
          });
        } else {
          await tx.holding.create({
            data: {
              userId: req.user.userId,
              stockId: stock.id,
              quantity: tradeQuantity,
              averagePrice: tradePrice,
            },
          });
        }
      }

      // SELL
      if (transactionType === "SELL") {
        if (!existingHolding) {
          throw new Error(
            `You do not own any shares of ${stock.symbol}`
          );
        }

        if (tradeQuantity > existingHolding.quantity) {
          throw new Error(
            `Cannot sell ${tradeQuantity} shares. You only own ${existingHolding.quantity} shares.`
          );
        }

        const remainingQuantity =
          existingHolding.quantity - tradeQuantity;

        if (remainingQuantity === 0) {
          await tx.holding.delete({
            where: {
              id: existingHolding.id,
            },
          });
        } else {
          await tx.holding.update({
            where: {
              id: existingHolding.id,
            },
            data: {
              quantity: remainingQuantity,
            },
          });
        }
      }

      // Record transaction
      const transaction = await tx.transaction.create({
        data: {
          userId: req.user.userId,
          stockId: stock.id,
          type: transactionType,
          quantity: tradeQuantity,
          price: tradePrice,
          totalAmount,
        },
        include: {
          stock: true,
        },
      });

      const updatedHolding = await tx.holding.findUnique({
        where: {
          userId_stockId: {
            userId: req.user.userId,
            stockId: stock.id,
          },
        },
        include: {
          stock: true,
        },
      });

      return {
        transaction,
        holding: updatedHolding,
      };
    });

    res.status(201).json({
      success: true,
      message: `${transactionType} order recorded successfully`,
      transaction: result.transaction,
      holding: result.holding,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message || "Transaction failed",
    });
  }
});

module.exports = router;