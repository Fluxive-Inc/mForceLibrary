import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document } from '../models/documents.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/documents';

  getAll(): Observable<Document[]> {
    return this.http.get<Document[]>(this.baseUrl, { withCredentials: true });
  }

  create(item: Partial<Document>): Observable<Document> {
    return this.http.post<Document>(this.baseUrl, item, { withCredentials: true });
  }

  update(id: number, item: Partial<Document>): Observable<Document> {
    return this.http.put<Document>(`${this.baseUrl}/${id}`, item, { withCredentials: true });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { withCredentials: true });
  }
}
