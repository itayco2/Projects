export class EnrollmentModel {
    public id:string;
    public userId:string;
    public courseId:string;
    public enrolledAt:Date;


    public static toFormData(enrollment: EnrollmentModel): FormData{
        const formData = new FormData();
        formData.append("userId", enrollment.userId);
        formData.append("courseId", enrollment.courseId);
        return formData;
    }
}