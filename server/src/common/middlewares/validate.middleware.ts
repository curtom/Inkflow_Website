import { Request, Response, NextFunction } from 'express';
import { ZodType} from 'zod';

export function validate(schema: ZodType) {
    return (req: Request, _res: Response, next: NextFunction) => {
        try{
            schema.parse({
                body: req.body,
                params: req.params,
                query: req.query,
            });
            next();
        }catch (error) {
            next(error);
        }
    };
}