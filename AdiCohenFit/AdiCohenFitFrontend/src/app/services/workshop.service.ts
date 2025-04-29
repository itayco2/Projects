import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { workshopStore } from '../storage/workshop-store';
import { workshopModel } from '../models/workshop.model';
import { environment } from '../../environments/environment.development';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkshopService {

    private httpClient = inject(HttpClient);
    private workshopStore = inject(workshopStore);

    public async getAllWorkshops() : Promise<workshopModel[]> {
       if(this.workshopStore.count()) return this.workshopStore.workshops();

       const dbWorkshops$ = this.httpClient.get<workshopModel[]>(environment.workshopsUrl);
       const dbWorkshops = await firstValueFrom(dbWorkshops$);

       this.workshopStore.initWorkshops(dbWorkshops);
       return dbWorkshops;
    }

    public async getOneWorkshop(workshopId: string) : Promise<workshopModel> {
        const storeworkshop = this.workshopStore.workshops().find(w => w.id === workshopId);
        if(storeworkshop) return storeworkshop;
        const dbWorkshop$ = this.httpClient.get<workshopModel>(`${environment.workshopsUrl}/${workshopId}`);
        const dbWorkshop = await firstValueFrom(dbWorkshop$);
        return  dbWorkshop;
    }

    public async updateWorkshop(formData: FormData, id: string): Promise<void> {
        const dbWorkshop$ = this.httpClient.put(`${environment.workshopsUrl}/${id}`, formData);
        const updatedWorkshop = await firstValueFrom(dbWorkshop$);
        this.workshopStore.updateWorkshop(updatedWorkshop as workshopModel);
    }
    



public async addWorkshopWithFormData(formData: FormData): Promise<workshopModel> {
    try {
      const dbWorkshop$ = this.httpClient.post<workshopModel>(environment.workshopsUrl, formData);
      const dbWorkshop = await firstValueFrom(dbWorkshop$);
      this.workshopStore.addWorkshop(dbWorkshop);
      return dbWorkshop;
    } catch (error) {
      console.error('Error adding workshop:', error);
      throw error;
    }
  }

  public async deleteWorkshop(workshopId: string): Promise<void> {
    if (!workshopId) {
    }
    
    const dbWorkshop$ = this.httpClient.delete<workshopModel>(`${environment.workshopsUrl}/${workshopId}`);
    await firstValueFrom(dbWorkshop$);
    this.workshopStore.deleteWorkshop(workshopId);
  }


}
