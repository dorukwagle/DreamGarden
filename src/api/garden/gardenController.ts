import express from "express";
import { getGarden, initiateGarden, updateGarden } from "./gardenModel";
import SessionRequest from "../../entities/SessionRequest";


const garden = express.Router();

garden.get("/", async (req: SessionRequest, res) => {
    const {error, statusCode, data} = await getGarden(req.session!.userId);
    res.status(statusCode).json(error || data);
});

garden.post("/initiate", async (req: SessionRequest, res) => {
    const {error, statusCode, data} = await initiateGarden(req.session!.userId, req.body);
    res.status(statusCode).json(error || data);
});

garden.put("/update", async (req: SessionRequest, res) => {
    const {error, statusCode, data} = await updateGarden(req.session!.userId, req.body);
    res.status(statusCode).json(error || data);
});

export default garden;