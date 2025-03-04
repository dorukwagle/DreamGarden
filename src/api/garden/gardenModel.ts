import { Plant, PlantType, ProgressStreak } from "@prisma/client";
import ModelReturnTypes from "../../entities/ModelReturnTypes";
import formatValidationErrors from "../../utils/formatValidationErrors";
import prismaClient from "../../utils/prismaClient";
import InitialPrompt, {
    InitialPromptType,
} from "../../validations/InitialPrompt";
import Prompt, { PromptType } from "../../validations/Prompt";
import { analyzeHabits, calculateProgress } from "./modelCall";

type ProgressStatus = "progress" | "degrade" | "constant";
type PlantInitiateType = ["Good" | "Bad", "Good" | "Bad", number, number];

export type UpdatePromptType = {
    foodPrompt: ProgressStatus;
    healthPrompt: ProgressStatus;
    toxicPrompt: ProgressStatus;
};

export type InitiatePromptType = {
    foodPrompt: PlantInitiateType;
    healthPrompt: PlantInitiateType;
    toxicPrompt: PlantInitiateType;
};

const getRandomPlant = (type: PlantType): Plant => {
    const randomNum = Math.floor(Math.random() * 6) + 1;

    const plant = type == "Good" ? "G" + randomNum : "B" + randomNum;
    return plant as Plant;
};

const progressGoodGarden = async (
    userId: string,
    prompt?: "Health" | "Food" | "Toxic"
) => {
    const data = prismaClient.userPlants.updateMany({
        where: {
            userId,
            prompt,
            plantType: "Good",
            health: {
                lt: 10,
            }
        },
        data: {
            health: {
                increment: 1,
            },
        },
    });

    console.log("progressing good garden", prompt);

    // update history
    if (!prompt) {
        await prismaClient.statusTracks.createMany({
            data: [
                {
                    prompt: "Health",
                    status: "progress",
                    userId,
                },
                {
                    prompt: "Food",
                    status: "progress",
                    userId,
                },
                {
                    prompt: "Toxic",
                    status: "progress",
                    userId,
                },
            ],      
        })
    }
    else 
        await prismaClient.statusTracks.create({
            data: {
                prompt,
                status: "progress",
                userId,
            },
        });

    return data;
};

const progressBadGarden = async (
    userId: string,
    prompt?: "Health" | "Food" | "Toxic"
) => {
    const data = prismaClient.userPlants.updateMany({
        where: {
            userId,
            prompt,
            plantType: "Bad",
            health: {
                lt: 10,
            }
        },
        data: {
            health: {
                increment: 1,
            },
        },
    });

    console.log("progressing bad garden", prompt);

    // update history
    if (!prompt) {
        await prismaClient.statusTracks.createMany({
            data: [
                {
                    prompt: "Health",
                    status: "progress",
                    userId,
                },
                {
                    prompt: "Food",
                    status: "progress",
                    userId,
                },
                {
                    prompt: "Toxic",
                    status: "progress",
                    userId,
                },
            ],      
        })
    }
    else 
        await prismaClient.statusTracks.create({
            data: {
                prompt,
                status: "progress",
                userId,
            },
        });

    return data;
};

const degradeGoodGarden = async (
    userId: string,
    prompt?: "Health" | "Food" | "Toxic"
) => {
    const data = prismaClient.userPlants.updateMany({
        where: {
            userId,
            prompt,
            plantType: "Good",
            health: {
                gt: 0,
            }
        },
        data: {
            health: {
                decrement: 1,
            },
        },
    });

    console.log("degrading good garden", prompt);

    // update history
    if (!prompt) {
        await prismaClient.statusTracks.createMany({
            data: [
                {
                    prompt: "Health",
                    status: "degrade",
                    userId,
                },
                {
                    prompt: "Food",
                    status: "degrade",
                    userId,
                },
                {
                    prompt: "Toxic",
                    status: "degrade",
                    userId,
                },
            ],      
        })
    }
    else 
        await prismaClient.statusTracks.create({
            data: {
                prompt,
                status: "degrade",
                userId,
            },
        });

    return data;
};

const degradeBadGarden = async (
    userId: string,
    prompt?: "Health" | "Food" | "Toxic"
) => {
    const data = prismaClient.userPlants.updateMany({
        where: {
            userId,
            prompt,
            plantType: "Bad",
            health: {
                gt: 0,
            }
        },
        data: {
            health: {
                decrement: 1,
            },
        },
    });

    console.log("degrading bad garden", prompt);

    // update history
    if (!prompt) {
        await prismaClient.statusTracks.createMany({
            data: [
                {
                    prompt: "Health",
                    status: "degrade",
                    userId,
                },
                {
                    prompt: "Food",
                    status: "degrade",
                    userId,
                },
                {
                    prompt: "Toxic",
                    status: "degrade",
                    userId,
                },
            ],      
        })
    }
    else 
        await prismaClient.statusTracks.create({
            data: {
                prompt,
                status: "degrade",
                userId,
            },
        });

    return data;
};

const growGoodGarden = async (userId: string) => {
    return prismaClient.userPlants.updateMany({
        where: {
            userId,
            plantType: "Good",
            health: {
                gt: 5,
            },
            age: {
                lt: 10,
            }
        },
        data: {
            age: {
                increment: 1,
            },
        },
    });
};

const growBadGarden = async (userId: string) => {
    return prismaClient.userPlants.updateMany({
        where: {
            userId,
            plantType: "Bad",
            health: {
                gt: 5,
            },
            age: {
                lt: 10,
            }
        },
        data: {
            age: {
                increment: 1,
            },
        },
    });
};


const getGarden = async (userId: string) => {
    const res = { statusCode: 200 } as ModelReturnTypes;

    res.data = await prismaClient.userPlants.findMany({
        where: {
            userId,
        },
    }); 

    return res;
};

const initiateGarden = async (userId: string, body: InitialPromptType) => {
    const res = { statusCode: 200 } as ModelReturnTypes;

    const validation = InitialPrompt.safeParse(body);
    const error = formatValidationErrors(validation);
    if (error) return error;

    const data = validation.data!;

    // check if garden already exists
    const existingGarden = await prismaClient.userPlants.findFirst({
        where: {
            userId,
        },
    });
    if (existingGarden) {
        res.statusCode = 400;
        res.error = { error: "Garden already exists" };
        return res;
    }

    const initiatePrompt = await analyzeHabits(data);
    console.log(initiatePrompt);

    const { healthPrompt, foodPrompt, toxicPrompt } = initiatePrompt;

    await prismaClient.userPlants.createMany({
        data: [
            {
                userId,
                prompt: "Health",
                plantType: healthPrompt[0],
                plant: getRandomPlant(healthPrompt[0]),
                age: healthPrompt[2],
                health: healthPrompt[3],
            },
            {
                userId,
                prompt: "Food",
                plantType: foodPrompt[0],
                plant: getRandomPlant(foodPrompt[0]),
                age: foodPrompt[2],
                health: foodPrompt[3],
            },
            {
                userId,
                prompt: "Toxic",
                plantType: toxicPrompt[0],
                plant: getRandomPlant(toxicPrompt[0]),
                age: toxicPrompt[2],
                health: toxicPrompt[3],
            },
            {
                userId,
                prompt: "Health",
                plantType: healthPrompt[1],
                plant: getRandomPlant(healthPrompt[1]),
                age: healthPrompt[2],
                health: healthPrompt[3],
            },
            {
                userId,
                prompt: "Food",
                plantType: foodPrompt[1],
                plant: getRandomPlant(foodPrompt[1]),
                age: foodPrompt[2],
                health: foodPrompt[3],
            },
            {
                userId,
                prompt: "Toxic",
                plantType: toxicPrompt[1],
                plant: getRandomPlant(toxicPrompt[1]),
                age: toxicPrompt[2],
                health: toxicPrompt[3],
            },
        ],
    });

    await prismaClient.promptHistory.create({
        data: {
            userId,
            healthPrompt: JSON.stringify(data.healthPrompt),
            foodPrompt: JSON.stringify(data.regular),
            toxicPrompt: JSON.stringify(data.toxicPrompt),
            initialFoodPrompt: JSON.stringify(data.regular),
            initialHealthPrompt: JSON.stringify(data.healthPrompt),
            initialToxicPrompt: JSON.stringify(data.toxicPrompt),
        },
    });

    await prismaClient.progressStreak.create({
        data: {
            userId,
            foodStreak: 0,
            healthStreak: 0,
            toxicStreak: 0,
        },
    });

    return res;
};

const updateGarden = async (userId: string, body: PromptType) => {
    const res = { statusCode: 200 } as ModelReturnTypes;

    const validation = Prompt.safeParse(body);
    const error = formatValidationErrors(validation);
    if (error) return error;

    const data = validation.data!;
    const previousPrompt = await prismaClient.promptHistory.findUnique({
        where: {
            userId,
        },
    });

    if (!previousPrompt) {
        res.statusCode = 400;
        res.error = { error: "No previous prompt" };
        return res;
    }

    const updatePrompt = await calculateProgress(
        {
            initialFoodPrompt: JSON.parse(previousPrompt.initialFoodPrompt),
            initialHealthPrompt: JSON.parse(previousPrompt.initialHealthPrompt),
            initialToxicPrompt: JSON.parse(previousPrompt.initialToxicPrompt),
            foodPrompt: JSON.parse(previousPrompt.foodPrompt),
            healthPrompt: data.healthPrompt[0] == "same" ? previousPrompt.healthPrompt : JSON.parse(previousPrompt.healthPrompt),
            toxicPrompt: JSON.parse(previousPrompt.toxicPrompt),
        },
        data
    );
    console.log("data", data);
    console.log("response", updatePrompt);
    
    const streak = await updateStreak(userId, updatePrompt);
    console.log("streak", streak);
    await progressGarden(userId, streak as ProgressStreak);

    // degrade health of plants if not progressed over time
    // await degradeGardens(userId);

    await growGoodGarden(userId);
    await growBadGarden(userId);

    // finally transform if any plant is transformed from good to bad and vice versa
    await transformGarden(userId);

    await prismaClient.promptHistory.update({
        where: {
            userId,
        },
        data: {
            foodPrompt: JSON.stringify(data.foodPrompt),
            healthPrompt: data.healthPrompt[0] == "same" ? previousPrompt.healthPrompt : JSON.stringify(data.healthPrompt),
            toxicPrompt: JSON.stringify(data.toxicPrompt),
        },
    });

    return res;
};

const transformGarden = async (userId: string) => {
    const degraded = await prismaClient.userPlants.findMany({
        where: {
            userId,
            plantType: "Good",
            health: {
                lt: 1,
            },
        },
    });

    degraded.forEach(async (plant) => {
        await prismaClient.userPlants.update({
            where: {
                plantId: plant.plantId,
            },
            data: {
                plantType: "Bad",
                plant: getRandomPlant("Bad"),
                health: 6,
                age: 1
            },
        });

        console.log("transform to bad ", plant);
    });

    const grew = await prismaClient.userPlants.findMany({
        where: {
            userId,
            plantType: "Bad",
            health: {
                lt: 1,
            },
        },
    });

    grew.forEach(async (plant) => {
        console.log("transform to good ", plant);
        await prismaClient.userPlants.update({
            where: {
                plantId: plant.plantId,
            },
            data: {
                plantType: "Good",
                plant: getRandomPlant("Good"),
                health: 6,
                age: 1
            },
        });
    });
}

const progressGarden = async (userId: string, streak: ProgressStreak) => {
    const threshold = 2;

    if (streak.foodStreak >= threshold) {
        await progressGoodGarden(userId, "Food");
        await degradeBadGarden(userId, "Food");
        await resetStreak(userId, "foodStreak");
    }

    if (streak.healthStreak >= threshold) {
        await progressGoodGarden(userId, "Health");
        await degradeBadGarden(userId, "Health");
        await resetStreak(userId, "healthStreak");
    }

    if (streak.toxicStreak >= threshold) {
        await progressGoodGarden(userId, "Toxic");
        await degradeBadGarden(userId, "Toxic");
        await resetStreak(userId, "toxicStreak");
    }

    if (streak.foodStreak <= -threshold) {
        await progressBadGarden(userId, "Food");
        await degradeGoodGarden(userId, "Food");
        await resetStreak(userId, "foodStreak");
    }

    if (streak.healthStreak <= -threshold) {
        await progressBadGarden(userId, "Health");
        await degradeGoodGarden(userId, "Health");
        await resetStreak(userId, "healthStreak");
    }

    if (streak.toxicStreak <= -threshold) {
        await progressBadGarden(userId, "Toxic");
        await degradeGoodGarden(userId, "Toxic");
        await resetStreak(userId, "toxicStreak");
    }
}

const degradeGardens = async (userId: string) => {
    const health = await prismaClient.statusTracks.findMany({
        where: {
            userId,
            prompt: "Health",
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 2,
    });

    const food = await prismaClient.statusTracks.findMany({
        where: {
            userId,
            prompt: "Food",
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 2,
    });

    const toxic = await prismaClient.statusTracks.findMany({
        where: {
            userId,
            prompt: "Toxic",
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 2,
    });

    const toxicImproved = !toxic.filter((track) => track.status == "degrade").length;
    const foodImproved = !food.filter((track) => track.status == "degrade").length;
    const healthImproved = !health.filter((track) => track.status == "degrade").length;

    const toxicDegrade = !toxic.filter((track) => track.status == "progress").length;
    const foodDegrade = !food.filter((track) => track.status == "progress").length;
    const healthDegrade = !health.filter((track) => track.status == "progress").length;

    if (toxicImproved) 
        await degradeBadGarden(userId, "Toxic");
    
    if (foodImproved) 
        await degradeBadGarden(userId, "Food");
    
    if (healthImproved) 
        await degradeBadGarden(userId, "Health");
    
    if (toxicDegrade) 
        await degradeGoodGarden(userId, "Toxic");
    
    if (foodDegrade) 
        await degradeGoodGarden(userId, "Food");
    
    if (healthDegrade) 
        await degradeGoodGarden(userId, "Health");
}

const updateStreak = async (userId: string, { foodPrompt, healthPrompt, toxicPrompt }: UpdatePromptType) => {
    return prismaClient.progressStreak.update({
        where: {
            userId,
        },
        data: {
            foodStreak: foodPrompt == "constant" ? undefined :{
                [foodPrompt  == "progress" ? "increment" : "decrement"]: 1,
            },
            healthStreak: healthPrompt == "constant" ? undefined :{
                [healthPrompt  == "progress" ? "increment" : "decrement"]: 1,
            },
            toxicStreak: toxicPrompt == "constant" ? undefined :{
                [toxicPrompt  == "progress" ? "increment" : "decrement"]: 1,
            },
        },
        select: {
            foodStreak: true,
            healthStreak: true,
            toxicStreak: true,
        },
    });
}

const resetStreak = async (userId: string, type: "healthStreak" | "foodStreak" | "toxicStreak") => {
    return prismaClient.progressStreak.update({
        where: {
            userId,
        },
        data: {
            [type]: 0
        },
    });
}

export { getGarden, updateGarden, initiateGarden };
