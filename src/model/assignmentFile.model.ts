/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Document, model, Model, Schema } from 'mongoose';

export interface AssignmentFile {
    name: string,
    link: string,
    md5?: string,
    length: number
}

export interface AssignmentFileDocument extends AssignmentFile, Document {
}

export type AssignmentFileModel = Model<AssignmentFileDocument>;

const assignmentFileSchema = new Schema<AssignmentFileDocument, AssignmentFileModel>({
    name: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        require: true,
        minlength: 5,
    },
    md5: String,
    length: Number,
});


assignmentFileSchema.set('toJSON', {
    transfrom: (_document: any, returnObject: any) => {
        returnObject.fid = returnObject._id.toString();
        delete returnObject._id;
        delete returnObject.__v;
    }
});

const AssignmentFileModel = model<AssignmentFileDocument, AssignmentFileModel>("AssignmentFile", assignmentFileSchema);
export default AssignmentFileModel;