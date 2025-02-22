import { GoogleGenerativeAI, Tool } from "@google/generative-ai";
import { InitialPromptType } from "../../validations/InitialPrompt";
import { PromptType } from "../../validations/Prompt";
import { InitiatePromptType, UpdatePromptType } from "./gardenModel";

const genAI = new GoogleGenerativeAI(process.env.MODEL_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const analyzeHabits = async (
  prompt: InitialPromptType
): Promise<InitiatePromptType> => {
  const functionSchema = {
    name: "generate_plant_data",
    description:
      "Generates plant types, age, and health based on user habits.",
    parameters: {
      type: "object",
      properties: {
        foodPrompt: {
          type: "array",
          description: "Food-related plant classification",
          items: {
            type: "string"
          },
          minItems: 4,
          maxItems: 4
        },
        healthPrompt: {
          type: "array",
          description: "Health-related plant classification",
          items: {
            type: "string"
          },
          minItems: 4,
          maxItems: 4
        },
        toxicPrompt: {
          type: "array",
          description: "Toxic consumption plant classification",
          items: {
            type: "string"
          },
          minItems: 4,
          maxItems: 4
        }
      },
      required: ["foodPrompt", "healthPrompt", "toxicPrompt"]
    }
  };

  const input = `
  Analyze the following user habits and classify them into good or bad plants.
  Assign plant age and health (0-10) based on habit strength.
  If habit is mostly healthy, plant health (6 to 10). If habit is mostly unhealthy, plant health (0 to 4).

  **Food Habit:**
  Regular: ${JSON.stringify(prompt.regular)}
  Occasional: ${JSON.stringify(prompt.occasional)}

  **Health Status:** ${JSON.stringify(prompt.healthPrompt)}

  **Toxic Consumption:** ${JSON.stringify(prompt.toxicPrompt)}

  **Rules for Classification:**
  - Healthy food → ["good", "good"]
  - Mixed diet (some healthy, some unhealthy) → ["good", "bad"]
  - Mostly unhealthy or junk food → ["bad", "bad"]
  - Good health → ["good", "good"]
  - Health issues → ["good", "bad"]
  - No toxins → ["good", "good"]
  - Toxin consumption → ["bad", "bad"]
  - Only occasional toxin consumption → ["good", "bad"]

  **You MUST return a response in this exact format using the function generate_plant_data:**
  {
    "foodPrompt": ["good" | "bad", "good" | "bad", "age (0-10)", "health (0-10)"],
    "healthPrompt": ["good" | "bad", "good" | "bad", "age (0-10)", "health (0-10)"],
    "toxicPrompt": ["good" | "bad", "good" | "bad", "age (0-10)", "health (0-10)"]
  }

  Note: For age and health, use string values like "7" rather than numeric 7.
  `;

  try {    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: input }] }],
      tools: [{ function_declarations: [functionSchema] } as Tool],
    });

    const responseText = result.response.text();
    const calls = result.response.functionCalls();
    
    if (!calls || calls.length === 0) {
      // Fallback parsing logic in case the model didn't use function calling
      if (responseText) {
        try {
          // Try to extract JSON from the text response
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const extractedJson = JSON.parse(jsonMatch[0]);
            
            // Validate the extracted JSON
            if (extractedJson.foodPrompt && 
                extractedJson.healthPrompt && 
                extractedJson.toxicPrompt) {
              // Process the extracted data
              return {
                foodPrompt: processArray(extractedJson.foodPrompt),
                healthPrompt: processArray(extractedJson.healthPrompt),
                toxicPrompt: processArray(extractedJson.toxicPrompt)
              } as any;
            }
          }
        } catch (parseError) {
          console.error("Failed to parse JSON from text response:", parseError);
        }
      }
      
      throw new Error("No function calls found in the model response");
    }

    // Process the response to convert numeric strings to actual numbers
    const rawData = calls[0].args as any;

    return {
      foodPrompt: processArray(rawData.foodPrompt),
      healthPrompt: processArray(rawData.healthPrompt),
      toxicPrompt: processArray(rawData.toxicPrompt)
    } as any;
  } catch (error) {
    console.error("Error in analyzeHabits:", error);
    // Provide more detailed error information
    if (error instanceof Error) {
      throw new Error(`Failed to generate plant data: ${error.message}`);
    }
    throw new Error("Failed to generate plant data due to an unknown error");
  }
};

// Helper function moved outside to be reusable
const processArray = (arr: string[]): (string | number)[] => {
  return arr.map(item => {
    // If it's a numeric string, convert to number
    if (!isNaN(Number(item)) && item.trim() !== "") {
      return Number(item);
    }
    return item.charAt(0).toUpperCase() + item.slice(1);
  });
};

const calculateProgress = async (
  previousPrompt: PromptType,
  currentPrompt: PromptType
) => {
  const functionSchema = {
    name: "track_habit_progress",
    description:
      "Determines whether the user's habits are improving, degrading, or constant.",
    parameters: {
      type: "object",
      properties: {
        foodPrompt: { type: "string", enum: ["progress", "degrade", "constant"] },
        healthPrompt: { type: "string", enum: ["progress", "degrade", "constant"] },
        toxicPrompt: { type: "string", enum: ["progress", "degrade", "constant"] }
      },
      required: ["foodPrompt", "healthPrompt", "toxicPrompt"]
    }
  };

  const input = `
    Compare the user's daily habits and determine if they are progressing, degrading, or remaining constant.

    **Previous Prompt:**
    - foodPrompt: ${JSON.stringify(previousPrompt.foodPrompt)}
    - healthPrompt: ${JSON.stringify(previousPrompt.healthPrompt)}
    - toxicPrompt: ${JSON.stringify(previousPrompt.toxicPrompt)}

    **Current Prompt:**
    - foodPrompt: ${JSON.stringify(currentPrompt.foodPrompt)}
    - healthPrompt: ${JSON.stringify(currentPrompt.healthPrompt)}
    - toxicPrompt: ${JSON.stringify(currentPrompt.toxicPrompt)}

    **Rules for Classification:**
    - If healthier food is introduced → "progress"
    - If unhealthy food is introduced → "degrade"
    - If unhealthy food is removed → "progress"
    - If food consumption is healthier than before → "progress"
    - If food consumption is worse than before → "degrade"
    - If food remains the same → "constant"
    - If junk food increases → "degrade"
    - If a health issue improves → "progress"
    - If new health issues arise → "degrade"
    - If toxic consumption decreases → "progress"
    - If toxic consumption increases → "degrade"

   **IMPORTANT:** You MUST return ONLY a function call using track_habit_progress with the exact JSON format below:
{
  "foodPrompt": "progress" | "degrade" | "constant",
  "healthPrompt": "progress" | "degrade" | "constant",
  "toxicPrompt": "progress" | "degrade" | "constant"
}
Do not include any additional text.
    `;

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: input }] }],
        tools: [{ function_declarations: [functionSchema] } as Tool],
      });
  
      const calls = result.response.functionCalls();

      if (!calls || !calls.length) {
        // Fallback: try to extract JSON from text if a function call wasn't triggered.
        const responseText = result.response.text();
        try {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const extractedJson = JSON.parse(jsonMatch[0]);
            return extractedJson as UpdatePromptType;
          }
        } catch (parseError) {
          console.error("Failed to parse fallback JSON:", parseError);
        }
        throw new Error("No function call returned from track_habit_progress");
      }

      const rawData = calls[0].args as any;

      return {
        foodPrompt: rawData.foodPrompt,
        healthPrompt: rawData.healthPrompt,
        toxicPrompt: rawData.toxicPrompt
      } as UpdatePromptType;
    } catch (error) {
      console.error("Error in calculateProgress:", error);
      throw new Error(`Failed to track habit progress: ${error instanceof Error ? error.message : error}`);
    }
};

export {
    analyzeHabits,
    calculateProgress
}