import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatBotService {
  // Remplace par l'URL de ton API Laravel
  private apiUrl = 'http://localhost:3000/api/chat';

  constructor(private http: HttpClient) { }

  // Initialise une nouvelle conversation
  startNewChat(): Observable<any> {
    return this.http.post(`${this.apiUrl}/new`, {});
  }

  // Envoie un message dans une conversation spécifique
  sendMessage(conversationId: number, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${conversationId}/send`, { message });
  }

  // Récupère tout l'historique
  getHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`);
  }

  // Supprime une conversation
  deleteConversation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}