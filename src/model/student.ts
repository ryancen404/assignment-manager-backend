/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import mongoose from "mongoose";

/**
 * 对于每个assignment对象需要追加：是否已经完、是否已经批改和分数属性
 */
const studentSchema = new mongoose.Schema({
    studentNumber: {
        type: String,
        required: true,
    },
    studentName: {
        type: String,
        required: true,
    },
    class: {
        type: mongoose.Types.ObjectId,
        require: true,
    },
    teachers: [{
        type: mongoose.Types.ObjectId,
        ref: "Teacher"
    }],
    assignments: [{
        assignment: {
            type: mongoose.Types.ObjectId,
            ref: "Assignment"
        },
        status: {
            type: Boolean,
            default: false
        },
        corrected: {
            type: Boolean,
            default: false
        },
        score: {
            type: Number,
            default: 0
        }
    }]
});

studentSchema.set('toJSON', {
    transfrom: (_document: any, returnObject: any) => {
        returnObject.sid = returnObject._id.toString();
        delete returnObject._id;
        delete returnObject.__v;
    }
});

export default mongoose.model("Student", studentSchema);