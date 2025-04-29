export class ProgressModel {
    public Id: string;
    public userId: string;
    public lessonId: string;
    public watchedAt: Date;

    public toFormData(): FormData {
        const formData = new FormData();
        formData.append('Id', this.Id);
        formData.append('userId', this.userId);
        formData.append('lessonId', this.lessonId);
        return formData;
    }
}