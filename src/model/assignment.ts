/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
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
        default: false,
    },
    files: [{
        type: mongoose.Types.ObjectId,
        ref: "AssignmentFile"
    }]
});

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

export default mongoose.model("Assignment", assignmentSchema);