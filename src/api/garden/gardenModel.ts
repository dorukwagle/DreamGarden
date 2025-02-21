import ModelReturnTypes from "../../entities/ModelReturnTypes";
import prismaClient from "../../utils/prismaClient";
import { InitialPromptType } from "../../validations/InitialPrompt";
import { PromptType } from "../../validations/Prompt";


type ProgressStatus = "progress" | "degrade" | "constant";

type UpdatePromptType = {
    foodPrompt: ProgressStatus;
    healthPrompt: ProgressStatus;
    toxicPrompt: ProgressStatus;
}

const initiateModelCall = async () => {
    
}

const updateModelCall = async () => {
    return {
        foodPrompt: "progress",
        healthPrompt: "degrade",
        toxicPrompt: "progress",
    } as UpdatePromptType;
}

const getGarden = async (userId: string) => {
    const res = {statusCode: 200} as ModelReturnTypes;

    res.data = await prismaClient.userPlants.findMany({
        where: {
            userId
        }
    });

    return res;
}

const initiateGarden = async (userId: string, body: InitialPromptType) => {
    const res = {statusCode: 200} as ModelReturnTypes;


    return res;
}

const updateGarden = async (userId: string, body: PromptType) => {
    const res = {statusCode: 200} as ModelReturnTypes;


    return res;
}

export {
    getGarden,
    updateGarden,
    initiateGarden
}