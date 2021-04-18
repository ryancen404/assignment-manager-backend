/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { AssignmentFileDocument } from './assignmentFile';
import { ClasssDocument } from './classs';
import { TeacherDocument } from './teacher';

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
    status: String,
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

export interface Assignment {
    teacher: Types.ObjectId,
    assignName: string,
    desc?: string,
    startTime: Date,
    endTime: Date,
    class: Array<Types.ObjectId>,
    status?: string,
    corrected: boolean,
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

export default mongoose.model<AssignmentDocument, AssignmentModel>("Assignment", assignmentSchema);