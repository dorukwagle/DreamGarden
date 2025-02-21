import {Express} from "express";
import cookieParser from "cookie-parser";
import auth from "../api/auth/authController";
import users from "../api/users/usersController";
import authorize from "../middlewares/auth";
import samples from "../api/sample/samplesController";


const api = (p: string) => `/api/${p}`;

const initializeRoutes = (app: Express): void => {
    app.use(cookieParser());

    app.use(api("users"), users);
    app.use(api("auth"), auth);
    app.use(api("samples"), authorize, samples);
}

export default initializeRoutes;