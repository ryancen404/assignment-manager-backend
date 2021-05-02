/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { AssignmentFileDocument } from './assignmentFile.model';
import { ClasssDocument } from './classs.model';
import { TeacherDocument } from './teacher.model';

const assignmentSchema = new Schema<AssignmentDocument, AssignmentModel>({
    teacher: {
        type: mongoose.Types.ObjectId,
        ref: "Teacher",
        required: true
    },
    assignName: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    class: [{
        type: mongoose.Types.ObjectId,
        ref: "Classs"
    }],
    status: {
        type: String,
        default: "未开始"
    },
    corrected: {
        type: Boolean,
        reuired: true,
        default: false,
    },
    files: [{
        type: mongoose.Types.ObjectId,
        ref: "AssignmentFile"
    }]
});

export type AssignmentStatus = "未开始" | "进行中" | "已结束";

export interface Assignment {
    // 关联的教师id
    teacher: Types.ObjectId,
    // 作业名字
    assignName: string,
    // 描述
    desc?: string,
    // 开始日期
    startTime: Date,
    // 结束日期
    endTime: Date,
    // 关联的班级数组
    class: Array<Types.ObjectId>,
    // 作业的状态
    status?: AssignmentStatus,
    // 是否已经批改
    corrected: boolean,
    // 关联的文件信息
    files?: Array<Types.ObjectId>
}

export interface AssignmentDocument extends Assignment, Document {
    teacher: TeacherDocument["_id"],
    class: Types.Array<ClasssDocument["_id"]>,
    files: Types.Array<AssignmentFileDocument["_id"]>
}

export interface AssignmentPopulateDocument extends AssignmentDocument {
    teacher: TeacherDocument,
    class: Types.Array<ClasssDocument>,
    files: Types.Array<AssignmentFileDocument>
}

// 扩展model方法
export interface AssignmentModel extends Model<AssignmentDocument> {
    findTeacher(id: string): Promise<Omit<AssignmentPopulateDocument, "class" | "files">>
    findClass(id: string): Promise<Omit<AssignmentPopulateDocument, "teacher" | "files">>
    findFiles(id: string): Promise<Omit<AssignmentPopulateDocument, "teacher" | "class">>
}

assignmentSchema.statics.findTeacher = async function (
    this: Model<AssignmentDocument>,
    id: string
) {
    return this.findById(id).populate("teacher").exec();
};

assignmentSchema.statics.findClass = async function (
    this: Model<AssignmentDocument>,
    id: string
) {
    return this.findById(id).populate("class").exec();
};

assignmentSchema.statics.findFiles = async function (
    this: Model<AssignmentDocument>,
    id: string
) {
    return this.findById(id).populate("files").exec();
};


/**
 * when convert json delete __v & _id
 */
assignmentSchema.set('toJSON', {
    transfrom: (_document: any, returnObject: any) => {
        returnObject.assignId = returnObject._id.toString();
        delete returnObject._id;
        delete returnObject.__v;
    }
});

const AssignmentModel = mongoose.model<AssignmentDocument, AssignmentModel>("Assignment", assignmentSchema);
export default AssignmentModel;