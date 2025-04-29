export class CourseModel{
    public id:string;
    public title: string;
    public description: string;
    public createdAt:Date;



    public static toFormData(course: CourseModel): FormData{
        const formData = new FormData();
        formData.append("title", course.title);
        formData.append("description", course.description);
        formData.append("lessons", course.description);
        return formData;
    }
}