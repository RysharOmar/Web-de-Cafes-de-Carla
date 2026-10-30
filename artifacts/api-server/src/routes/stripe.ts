import { Router, type IRouter, type Request, type Response } from "express";
import { requiredEnv } from "../../../../lib/env";
import Stripe from "stripe";
import { logger } from "../lib/logger";

export const stripe = new Stripe(requiredEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2025-04-30.acacia",
});

export const stripeRouter: IRouter = Router();

stripeRouter.post(
  "/create-checkout-session",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { items } = req.body as {
        items?: Array<{
          name: string;
          priceCents: number;
          quantity: number;
          description?: string;
        }>;
      };

      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: "No items provided" });
        return;
      }

      const line_items = items.map((item) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
            ...(item.description ? { description: item.description } : {}),
          },
          unit_amount: item.priceCents,
        },
        quantity: item.quantity,
      }));

      const origin = (req.headers.origin as string) || "http://localhost:5000";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cancel`,
      });

      res.json({ url: session.url });
    } catch (err) {
      logger.error({ err }, "Error creating checkout session");
      res.status(500).json({ error: "No se pudo preparar el pago" });
    }
  },
);

export const stripeWebhookHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = requiredEnv("STRIPE_WEBHOOK_SECRET");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      webhookSecret,
    );
  } catch (err) {
    logger.warn({ err }, "Webhook signature verification failed");
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    logger.info(
      {
        sessionId: session.id,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total,
      },
      "Checkout session completed",
    );
    // TODO: guardar pedido en DB, enviar email de confirmación, etc.
  }

  res.json({ received: true });
};
