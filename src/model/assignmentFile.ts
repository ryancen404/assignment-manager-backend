/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import mongoose from 'mongoose';

const assignmentFileSchema = new mongoose.Schema({
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

export default mongoose.model("AssignmentFile", assignmentFileSchema);