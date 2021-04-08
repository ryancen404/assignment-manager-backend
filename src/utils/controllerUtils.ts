import { Response } from 'express';

export const resultNotNullHandle = (result: unknown | undefined | false, response: Response): void => {
    if (!result) {
        response.sendStatus(404);
    } else {
        response.send(result);
    }
};

