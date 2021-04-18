/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import mongoose, { Types, Document, Schema, Model } from "mongoose";
import { StudentDocument } from "./student";

const ClasssSchema = new Schema<ClasssDocument, ClasssModel>({
    className: {
        type: String,
        required: true
    },
    classNumber: {
        type: String,
        required: true,
    },
    students: [{
        type: Types.ObjectId,
        ref: "Student"
    }]
});

export interface Classs {
    className: string,
    classNumber: string,
    students: Array<Types.ObjectId>
}

export interface ClasssDocument extends Classs, Document {
    students: Types.Array<StudentDocument["_id"]>,
}

export interface ClassPopulateDocument extends ClasssDocument {
    students: Types.Array<StudentDocument>
}

export interface ClasssModel extends Model<ClasssDocument> {
    findMyStudents(id: string): Promise<ClassPopulateDocument>
}

ClasssSchema.statics.findMyStudents = async function (
    this: Model<ClasssDocument>,
    id: string
) {
    return this.findById(id).populate("students").exec();
};


ClasssSchema.set('toJSON', {
    transfrom: (_document: any, returnObject: any) => {
        returnObject.classId = returnObject._id.toString();
        delete returnObject._id;
        delete returnObject.__v;
    }
});

export default mongoose.model<ClasssDocument, ClasssModel>("Classs", ClasssSchema);