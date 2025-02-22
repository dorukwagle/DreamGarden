import { z } from "zod";
import InitialPrompt from "./InitialPrompt";

const Prompt = InitialPrompt.pick({
    healthPrompt: true,
    toxicPrompt: true,
}).extend({
    initialHealthPrompt: z.array(z.string()).optional(),
    initialToxicPrompt: z.array(z.string()).optional(),
    initialFoodPrompt: z.array(z.string()).optional(),
    foodPrompt: z.array(z.string()),
});

export type PromptType = z.infer<typeof Prompt>;
export default Prompt;
