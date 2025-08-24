export type TerrorSources={
    path: string| number;
    message:string;
}[];

export type TgenerateErrorResponse={
    statusCode:number;
    message:string;
    errorSource: TerrorSources
}