import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PromptModel } from '../models/prompt.model';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GptService {

    constructor(private http: HttpClient) { }

    public async getCompletion(prompt: PromptModel): Promise<string> {

        const body = {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: prompt.system },
                { role: "user", content: prompt.user },
            ]
        };

        const headers = new HttpHeaders().set("authorization", "Bearer " + environment.apiKey);

        const response$ = this.http.post<any>(environment.gptUrl, body, { headers });

        const response = await firstValueFrom(response$);

        const completion = response.choices[0].message.content;

        return completion;
    }
}
