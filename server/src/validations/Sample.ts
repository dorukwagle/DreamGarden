import { z } from "zod";

const Sample = z.object({
    title: z.string({ required_error: "Title is required" })
        .min(3, "Title must be at least 3 characters long"),
    body: z.string().min(3, "Body must be at least 3 characters long").optional(),
    status: z.enum(["Pending", "Completed"]).optional(),
});

export type SampleType = z.infer<typeof Sample>;
export default Sample;