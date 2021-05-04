import { Types } from "mongoose";
import ServiceConfig from "../config/service.config";
import { Class, Student } from "../controller/request.type";
import ClassModel, { ClassPopulateDocument } from "../model/classs.model";
import StudentModel from "../model/student.model";
import TeacherModel from "../model/teacher.model";


const getTeacherClass = async (tid: string) => {
  const teacherWithClass = await TeacherModel.findClass(tid);
  for (let i in teacherWithClass.class) {
    await teacherWithClass.class[i].populate("students").execPopulate();
  }
  ServiceConfig.logger("teacherWithClass: ", teacherWithClass);
  // 填充班级里的学生
  let result: Class.ResBrowseClass[] = [];
  if (teacherWithClass.class !== undefined) {
    result = toResBrowseClass(teacherWithClass.class);
  }
  return result;
};

const getTeacherBaseClass = async (tid: string) => {
  const teacherWithClass = await TeacherModel.findClass(tid);
  ServiceConfig.logger("teacherWithClass: ", teacherWithClass);
  let result: Class.ResBaseClass[] = [];
  if (teacherWithClass.class !== undefined) {
    result = toResBaseClass(teacherWithClass.class);
  }
  return result;
}

const toResBaseClass = (classes: Types.Array<ClassPopulateDocument>) => {
  const result = classes.map(clazz => {
    const baseClass: Class.ResBaseClass = {
      classId: clazz.id,
      classNumber: clazz.classNumber,
      className: clazz.className,
    }
    return baseClass
  })
  return result;
}

// 转换成浏览页面需要的数据结构
const toResBrowseClass = (classs: Types.Array<ClassPopulateDocument>) => {
  const result = classs.map((clazz) => {
    const students = clazz.students.map(student => {
      const resStudent: Student.ResBaseStudent = {
        sId: student.id,
        studentName: student.studentName,
        studentNumber: student.studentNumber,
        grade: student.grade,
        classId: clazz.id,
      };
      return resStudent;
    });

    const browseClass: Class.ResBrowseClass = {
      classId: clazz.id,
      className: clazz.className,
      classNumber: clazz.classNumber,
      students
    };
    return browseClass;
  });
  return result;
};

const deleteClassStudent = async (classId: string, sId: string) => {
  const clazz = await ClassModel.findById(classId);
  if (!clazz) {
    return false;
  }
  const newStudents = clazz.students.filter(s => s.toString() !== sId);
  const result = await clazz.updateOne({ students: newStudents }).exec();
  if (!result || result.ok !== 1) {
    return false;
  }
  const student = await StudentModel.findById(sId);
  if (!student) {
    return false;
  }
  const result2 = await student.updateOne({ classId: null }).exec();
  if (!result2 || result2.ok !== 1) {
    return false;
  }
  return true;
};


const classService = {
  getTeacherClass,
  deleteClassStudent,
  getTeacherBaseClass
};

export default classService;