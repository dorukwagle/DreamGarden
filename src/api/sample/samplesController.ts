import express from "express";
import SessionRequest from "../../entities/SessionRequest";
import { PaginationParamsType } from "../../validations/PaginationParams";
import { createSample, deleteSample, paginateSamples } from "./samplesModel";


const samples = express.Router();

samples.post("/", async (req: SessionRequest, res) => {
    const {error, statusCode, data} = await createSample(req.session!.userId, req.body);
    res.status(statusCode).json(error || data);
});

samples.delete("/:todoId", async (req: SessionRequest<{todoId: string}>, res) => {
    await deleteSample(req.session!.userId, req.params.todoId);

    res.status(200).end();
});

samples.get("/", async (req: SessionRequest<{}, any, any, PaginationParamsType>, res) => {
    const {error, statusCode, data, info } = await paginateSamples(req.session!.userId, req.query);
    res.status(statusCode).json(error ? error : {data, info});
});

export default samples;