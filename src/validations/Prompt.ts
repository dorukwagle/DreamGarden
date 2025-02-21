import { z } from "zod";
import InitialPrompt from "./InitialPrompt";

const Prompt = InitialPrompt.pick({
    healthPrompt: true,
    toxicPrompt: true,
}).extend({
    foodPrompt: z.array(z.string()),
});

export type PromptType = z.infer<typeof Prompt>;
export default Prompt;
