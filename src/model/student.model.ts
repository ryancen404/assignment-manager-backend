/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import mongoose, { Model, Schema, Types, Document } from "mongoose";
import { AssignmentDocument } from "./assignment.model";
import { ClasssDocument } from "./classs.model";
import { TeacherDocument } from "./teacher.model";

/**
 * 对于每个assignment对象需要追加：是否已经完、是否已经批改和分数属性
 */
const StudentAssignmentSchema = new Schema({
    assignment: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Assignment"
    },
    // 上传的作业内容
    files: [{
        type: mongoose.Types.ObjectId,
        ref: "AssignmentFile"
    }],
    assignmentStatus: {
        type: Boolean,
        required: true,
        default: false
    },
    corrected: {
        type: Boolean,
        required: true,
        default: false
    },
    score: {
        type: Number,
        required: true,
        default: 0
    }
},
    { _id: false }
);

// 学生作业类型,是嵌套在Student Document里的子field
export interface StudentAssignment {
    assignment: Types.ObjectId,
    assignmentStatus: boolean,
    corrected: boolean,
    score: number,
    files?: Array<Types.ObjectId>
}

export interface StudentAssignmentDocument extends StudentAssignment, Document {

}

const StudentSchema = new Schema<StudentDocument, StudentModel>({
    studentNumber: {
        type: String,
        required: true,
    },
    studentName: {
        type: String,
        required: true,
    },
    classId: {
        type: mongoose.Types.ObjectId,
        require: true,
    },
    teachers: [{
        type: mongoose.Types.ObjectId,
        ref: "Teacher"
    }],
    grade: {
        type: String,
        required: true,
    },
    assignments: [StudentAssignmentSchema],
    passwordHash: {
        type: String,
        required: true
    }
});

export interface Student {
    studentNumber: string,
    studentName: string,
    grade: string,
    classId: Types.ObjectId,
    teachers?: Array<Types.ObjectId>,
    assignments?: Array<StudentAssignment>,
    // 默认密码是学号
    passwordHash: string
}

export interface StudentDocument extends Student, Document {
    classId: ClasssDocument["_id"],
    teachers: Types.Array<TeacherDocument["_id"]>,
    assignments: Types.Array<StudentAssignment>,
}

export interface StudentPopulateTeacherDocument extends StudentDocument {
    teachers: Types.Array<TeacherDocument>
}

export interface StudentPopulateAssignDocument extends StudentDocument {
    assignments: Types.Array<StudentAssignmentDocument>
}

export interface StudentModel extends Model<StudentDocument> {
    findMyTeachers(id: string): Promise<StudentPopulateTeacherDocument>,
    findMyAssignments(id: string): Promise<StudentPopulateAssignDocument>
}

StudentSchema.statics.findMyTeachers = async function (
    this: Model<StudentDocument>,
    id: string
) {
    return this.findById(id).populate("teacher").exec();
};

StudentSchema.statics.findMyAssignments = async function (
    this: Model<StudentDocument>,
    id: string
) {
    return this.findById(id).populate("assignments").exec();
};


StudentSchema.set('toJSON', {
    transfrom: (_document: any, returnObject: any) => {
        returnObject.sid = returnObject._id.toString();
        delete returnObject._id;
        delete returnObject.__v;
    }
});

const StudentModel = mongoose.model<StudentDocument, StudentModel>("Student", StudentSchema);
export default StudentModel;