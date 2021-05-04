import fs from 'fs';
import path from 'path';
import xlsx from 'node-xlsx';
import ServiceConfig from '../config/service.config';
import { ImportError, ParamError } from '../other/custom.error';
import StudentModel, { Student } from '../model/student.model';
import { Types } from 'mongoose';
import ClassModel, { Classs, ClasssDocument } from '../model/classs.model';
import { parseString } from '../other/api.helper';
import TeacherModel from '../model/teacher.model';
import { getRandomInt } from '../utils/service.utils';

/**
 * 解析xlsx录入到DB
 * @param file 上传的文件
 * @returns 处理是否成功
 */
const handleStudentImport = async (userId: string, file: Express.Multer.File) => {
  try {
    const teacher = await TeacherModel.findById(userId);
    if (teacher === null) {
      throw new ParamError("teacher non-existent!")
    }
    const originalPath = file.path;
    ServiceConfig.logger("upload file path:", originalPath);
    const sheets = xlsx.parse(`${originalPath}`)
    let clazz: Classs | null = null;
    let savedClazz: ClasssDocument | null = null;
    let clazzStudentIds: Types.ObjectId[] = []
    sheets.forEach(async sheet => {
      for (let i in sheet["data"]) {
        const row: any[] = sheet["data"][i];
        ServiceConfig.logger("read raw:", row)
        if (i === "0") {
          checkTitleRow(row);
          continue;
        }
        // 创建班级
        if (clazz === null) {
          clazz = {
            className: parseString(row[2]),
            classNumber: row[3].toString(),
            students: clazzStudentIds
          }
          savedClazz = await ClassModel.create(clazz);
        }
        // 保存学生到班级
        const sId = await saveStudent(row, savedClazz?._id, teacher?._id);
        savedClazz?.students.addToSet(sId);
      }
      await savedClazz?.updateOne({ students: savedClazz.students });
      teacher.class.addToSet(savedClazz?._id);
      await teacher.updateOne({ class: teacher.class });
    })
    // 删除文件
    fs.unlinkSync(originalPath);
  } catch (error) {
    ServiceConfig.logger("handle Student Import error", error);
    return false;
  }
  return true;
}

/**
 * 把上传的附件的服务端附件名返回给客户端
 **/
const moveAttachment = async (userId: string, file: Express.Multer.File) => {
  let filename = "";
  try {
    const originalPath = file.path;
    const extName = path.extname(file.originalname);
    const originalFileName = file.originalname.replace(extName, "");
    const fileReader = fs.createReadStream(originalPath);
    const outputDir = `./.data/temp/attachment/${userId}`
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    filename = `${originalFileName}_${getRandomInt(100)}${extName}`
    const fileOutputPath = `${outputDir}/${filename}`
    const fileWriter = fs.createWriteStream(fileOutputPath);
    fileReader.pipe(fileWriter);
    // 删除源文件
    fs.unlinkSync(originalPath);
  } catch (error) {
    ServiceConfig.logger("move temp attachment error:", error);
    return null;
  }
  return filename;
}

/**
 * 把临时附件移动到自己的目录下
 */
const moveAssignmentAttach = async (userId: string, fileNames?: string[]) => {
  if (fileNames === undefined || fileNames.length === 0) {
    return true;
  }
  try {
    fileNames.forEach(name => {
      const originalPath = `.data/temp/attachment/${userId}/${name}`;
      const fileReader = fs.createReadStream(originalPath);
      const outputDir = `./.data/assignment/${userId}`
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const fileOutputPath = `${outputDir}/${name}`
      const fileWriter = fs.createWriteStream(fileOutputPath);
      fileReader.pipe(fileWriter);
      // 删除源文件
      fs.unlinkSync(originalPath);
    })
  } catch (error) {
    ServiceConfig.logger("move attachment to myslef error:", error);
    return false;
  }
  return true;
}


const FilesService = {
  handleStudentImport,
  moveAttachment,
  moveAssignmentAttach
}

export default FilesService;

function checkTitleRow(row: any[]) {
  if (row[0] !== '姓名' || row[1] !== "学号" || row[2] !== "班级" || row[3] !== "班级号"
    || row[4] !== "年级" || row[5] !== "学院") {
    throw new ImportError("frist row format error");
  }
}

const saveStudent = async (row: any[], classId: Types.ObjectId, tId: Types.ObjectId) => {
  // 查看该学生是否已经存在在db中
  const foundStudent = await StudentModel.findOne({ studentName: row[0], studentNumber: row[1].toString() });
  if (foundStudent !== null) {
    const teachers = foundStudent.teachers;
    foundStudent.teachers.addToSet(tId);
    await foundStudent.updateOne({ teacher: teachers }).exec()
    return foundStudent._id;
  }
  const myTeahcer = []
  myTeahcer.push(tId)
  const student: Student = {
    studentName: row[0],
    studentNumber: row[1].toString(),
    grade: row[4].toString(),
    classId: classId,
    teachers: myTeahcer,
  }
  const savedStudent = await StudentModel.create(student)
  return savedStudent._id;
}
