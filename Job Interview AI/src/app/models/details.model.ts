export enum Level {
    Beginner = "Beginner",
    Intermediate = "Intermediate",
    Expert = "Expert"
}

export class DetailsModel {
    public subject: string;
    public count = 5;
    public level = Level.Beginner;
}
