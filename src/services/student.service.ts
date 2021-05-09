import StudentModel from "../model/student.model";


const getStudentByStuNumber = async (stuNumber: string) => {
  return await StudentModel.findOne({ studentNumber: stuNumber })
}

const StudentService = {
  getStudentByStuNumber
}

export default StudentService;