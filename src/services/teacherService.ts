import { User } from "../controller/request.type";
import bcrypt from 'bcrypt';
import config from "../utils/config";
import TeacherModel, { Teacher, TeacherDocument } from "../model/teacher";
import logger from "../utils/logger";

const TAG = "[TeacherService] => ";

// 创建新的教师用户
const createNewTeacher = async (newTeacher: User.NewTeacher): Promise<boolean> => {
    // 先查找是否已经存在这个账户
    const targetTeacher = await TeacherModel.findOne({ account: newTeacher.account });
    if (targetTeacher !== null) {
        logger.error(TAG, "newTeacher is existence");
        return false;
    }
    // 对密码进行hash
    try {
        const salt = await bcrypt.genSalt(config.USER_PWD_SALT);
        const passwordHash = await bcrypt.hash(newTeacher.password, salt);
        const teacher: Teacher = {
            username: newTeacher.username,
            account: newTeacher.account,
            passwordHash: passwordHash,
            college: newTeacher.college,
        };
        const savedTeacher = await TeacherModel.create(teacher);
        logger.info(TAG, "save Teacher success, the id is:", savedTeacher._id);
    } catch (error) {
        console.log(error);
        return false;
    }
    return true;
};

// 获取教师用户
const getTeacherByAccount = async (account: string): Promise<TeacherDocument | null> => {
    // 查找用户，并返回
    return await TeacherModel.findOne({ account });
};

export default {
    createNewTeacher,
    getTeacherByAccount
};