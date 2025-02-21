import ModelReturnTypes from "../../entities/ModelReturnTypes";
import PaginationReturnTypes from "../../entities/PaginationReturnTypes";
import formatValidationErrors from "../../utils/formatValidationErrors";
import prismaClient from "../../utils/prismaClient";
import Sample, { SampleType } from "../../validations/Sample";
import PaginationParams, { PaginationParamsType } from "../../validations/PaginationParams";
import { DEFAULT_PAGE_SIZE } from "../../entities/constants";
import { getPaginatedItems } from "../../utils/paginator";


const createSample = async (userId: string, body: SampleType) => {
    const res = { statusCode: 201 } as ModelReturnTypes;

    const validation = Sample.safeParse(body);

    const error = formatValidationErrors(validation);
    if (error) return error;

    const data = validation.data!;

    res.data = await prismaClient.samples.create({
        data: {
            ...data,
            userId,
        },
    });

    return res;
};

const deleteSample = async (userId: string, sampleId: string) => {
    await prismaClient.samples.update({
        where: {
            userId,
            sampleId,
        },
        data: {
            deletedAt: new Date(),
        }
    });
};

const paginateSamples = async (userId: string, body: PaginationParamsType): Promise<PaginationReturnTypes> => {
    
    return getPaginatedItems("samples", body, { 
        defaultSeed: body.seed || "test sample",
        fields: [
            { column: "userId", seed: userId },
            { column: "title" },
            { column: "body", search: true },
        ],
        operator: "AND",
     }, [], { createdAt: "desc" });
};

export { createSample, deleteSample, paginateSamples };
