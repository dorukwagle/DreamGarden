import { z } from "zod";

const PaginationParams = z.object({
    page: z.coerce.number().min(1).optional(),
    pageSize: z.coerce
        .number()
        .min(3, "Page size must be at least 3")
        .optional(),
    seed: z.string().optional(), // for text search
    // further extension: text, date & number
    status: z.enum(["Pending", "Completed"]).optional(),
});

export type PaginationParamsType = z.infer<typeof PaginationParams>;
export default PaginationParams;
