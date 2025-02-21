import {Express} from "express";
import cookieParser from "cookie-parser";
import auth from "../api/auth/authController";
import users from "../api/users/usersController";
import authorize from "../middlewares/auth";
import garden from "../api/garden/gardenController";


const api = (p: string) => `/api/${p}`;

const initializeRoutes = (app: Express): void => {
    app.use(cookieParser());

    app.use(api("users"), users);
    app.use(api("auth"), auth);
    app.use(api("garden"), authorize, garden);    
}

export default initializeRoutes;