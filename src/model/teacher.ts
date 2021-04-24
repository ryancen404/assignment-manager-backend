/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { AssignmentDocument } from "./assignment";
import { ClassPopulateDocument, ClasssDocument } from "./classs";

// 参考自https://medium.com/@agentwhs/complete-guide-for-typescript-for-mongoose-for-node-js-8cc0a7e470c1
/**
 * 内存中使用的类型
 */
export interface Teacher {
    username: string,
    account: string,
    passwordHash: string,
    avator?: string,
    college: string,
    class?: Array<Types.ObjectId>,
    assignments?: Array<Types.ObjectId>
}

/**
 * 存储的文档类型, 可以用来实现查询
 */
export interface TeacherDocument extends Teacher, Document {
    class?: Types.Array<ClasssDocument["_id"]>,
    assignments?: Types.Array<AssignmentDocument["_id"]>,
}

export interface TeacherPopulateDocument extends TeacherDocument {
    class?: Types.Array<ClassPopulateDocument>,
    assignments?: Types.Array<AssignmentDocument>,
}

export interface TeacherModel extends Model<TeacherDocument> {
    findClass(id: string): Promise<Omit<TeacherPopulateDocument, "assignments">>,
    findAssignments(id: string): Promise<Omit<TeacherPopulateDocument, "class">>,
    findMyAll(id: string): Promise<TeacherPopulateDocument>,
}

const teacherSchema = new Schema<TeacherDocument, TeacherModel>({
    username: {
        type: String,
        required: true
    },
    account: {
        type: String,
        require: true
    },
    passwordHash: {
        type: String,
        require: true
    },
    avator: String,
    college: {
        type: String,
        required: true
    },
    class: [{
        type: mongoose.Types.ObjectId,
        ref: "Classs"
    }],
    assignments: [{
        type: mongoose.Types.ObjectId,
        ref: "Assignment"
    }]
});

// 扩展函数
teacherSchema.statics.findClass = async function (
    this: Model<TeacherDocument>,
    id: string
) {
    return this.findById(id).populate("class").populate("students").exec();
};

teacherSchema.statics.findAssignments = async function (
    this: Model<TeacherDocument>,
    id: string
) {
    return this.findById(id).populate("assignments").exec();
};

teacherSchema.statics.findMyAll = async function (
    this: Model<TeacherDocument>,
    id: string
) {
    return this.findById(id).populate("assignments").populate("class").exec();
};

teacherSchema.set('toJSON', {
    transfrom: (_document: any, returnObject: any) => {
        returnObject.tid = returnObject._id.toString();
        delete returnObject._id;
        delete returnObject.__v;
    }
});

const TeacherModel = mongoose.model<TeacherDocument, TeacherModel>("Teacher", teacherSchema);

export default TeacherModel;