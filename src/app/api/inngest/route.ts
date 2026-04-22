import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { scoreProducts, syncSupplierData, optimizeProduct } from "@/inngest/functions";

// NUCLEAR 25: Register background jobs for 250k user scale
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        scoreProducts,
        syncSupplierData,
        optimizeProduct
    ],
});
