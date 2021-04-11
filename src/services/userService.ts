import { NewTeacher } from "../../type";

const createNewTeacher = async (_teacher: NewTeacher): Promise<boolean> => {
    return Promise.resolve(true);
};

export default {
    createNewTeacher,
};