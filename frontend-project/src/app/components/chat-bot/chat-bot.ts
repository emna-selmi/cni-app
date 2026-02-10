import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './chat-bot.html',
  styleUrls: ['./chat-bot.css'],
})
export class ChatBotComponent implements OnInit {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  isOpen = false;
  showHistory = false;
  userInput = '';
  history: any[] = [];
  activeConversation: any = null;
  isTyping = false;
  remainingMessages = 20; // start with daily limit

  private apiUrl = 'http://localhost:3000/api/chat';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadHistory();
  }

  scrollToBottom(): void {
    try {
      if (this.myScrollContainer) {
        const el = this.myScrollContainer.nativeElement;
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
        if (isNearBottom) el.scrollTop = el.scrollHeight;
      }
    } catch {}
  }

  private getOptions() {
    const token = localStorage.getItem('token');
    return { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
  }

  toggleChat() { this.isOpen = !this.isOpen; }
  toggleHistory() { this.showHistory = !this.showHistory; }

  loadHistory() {
    this.http.get(`${this.apiUrl}/history`, this.getOptions()).subscribe({
      next: (res: any) => {
        this.history = res;
        if (!this.activeConversation && this.history.length > 0) this.activeConversation = this.history[0];
      },
      error: err => console.error('Erreur historique:', err)
    });
  }

  startNewChat() {
    this.http.post(`${this.apiUrl}/new`, {}, this.getOptions()).subscribe({
      next: (res: any) => {
        this.activeConversation = res.conversation;
        this.activeConversation.messages = [];
        this.remainingMessages = res.remaining;
        this.loadHistory();
        this.showHistory = false;
      },
      error: err => {
        if (err.status === 429) alert(err.error.error);
        console.error(err);
      }
    });
  }

  send() {
    if (!this.userInput.trim() || !this.activeConversation || this.remainingMessages <= 0) return;

    this.isTyping = true;
    const messageToSend = this.userInput;
    this.activeConversation.messages.push({ content: messageToSend, role: 'user' });
    this.userInput = '';

    this.http.post(`${this.apiUrl}/${this.activeConversation.id}/send`, { message: messageToSend }, this.getOptions())
      .subscribe({
        next: (res: any) => {
          this.activeConversation.messages.push(res.message);
          this.remainingMessages = res.remaining;
          this.isTyping = false;
          this.scrollToBottom();
        },
        error: err => {
          this.isTyping = false;
          if (err.status === 429) alert(err.error.error);
          console.error('Erreur API:', err);
        }
      });
  }

  selectConversation(conv: any) {
    this.activeConversation = conv;
    this.showHistory = false;
    setTimeout(() => this.scrollToBottom(), 50);
  }

  deleteConv(id: number) {
    if(confirm('Supprimer cette discussion ?')) {
      this.http.delete(`${this.apiUrl}/${id}`, this.getOptions()).subscribe({
        next: () => {
          if (this.activeConversation?.id === id) this.activeConversation = null;
          this.loadHistory();
        },
        error: err => console.error(err)
      });
    }
  }
}
