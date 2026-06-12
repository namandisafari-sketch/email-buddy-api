import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getServerConfig } from "../config.server";

export const requestMomoPayment = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      phone: z.string().min(1),
      network: z.enum(["mtn"]),
      amount: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const config = getServerConfig();

    console.log(
      `[MTN MoMo] Initiating payment: ${data.amount} UGX from ${data.phone}`,
    );
    console.log(`[MTN MoMo] API key: ${config.momo.subscriptionKey}`);

    return {
      success: false,
      error: "MTN network currently not fine",
    };
  });
