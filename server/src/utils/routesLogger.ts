import { Request, Response, NextFunction } from 'express';

const routesLogger = (req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method}: ${req.path}`);
    next();
}

export default routesLogger;