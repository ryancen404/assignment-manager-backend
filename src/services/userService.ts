import { BaseTeacher } from "../../type";

const createNewTeacher = async (_teacher: BaseTeacher): Promise<boolean> => {
    return Promise.resolve(true);
};

export default {
    createNewTeacher,
};