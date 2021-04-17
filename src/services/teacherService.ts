import { Login, User } from "../controller/requestType";

const createNewTeacher = async (_teacher: User.NewTeacher): Promise<boolean> => {
    return Promise.resolve(true);
};

const getTeacher = async (_user: Login.User) => {
    return Promise.resolve(true);
}

export default {
    createNewTeacher,
    getTeacher
};