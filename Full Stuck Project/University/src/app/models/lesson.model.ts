import { publishFacade } from "@angular/compiler";

export class LessonModel{
    public id:string;
    public courseId:string;
    public title:string;
    public videoUrl:string;



    public static toFormData(lesson: LessonModel):FormData{
        const formData = new FormData();
        formData.append("courseId", lesson.courseId);
        formData.append("title", lesson.title);
        formData.append("videoUrl", lesson.videoUrl);
        return formData;
    }
}

