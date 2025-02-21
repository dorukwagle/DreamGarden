import { z } from "zod";

const InitialPrompt = z.object({
    regular: z.array(z.string()),
    occasional: z.array(z.string()),
    healthPrompt: z.array(z.string()),
    toxicPrompt: z.array(z.string()),
});

export type InitialPromptType = z.infer<typeof InitialPrompt>;
export default InitialPrompt;