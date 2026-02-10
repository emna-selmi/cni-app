\# CNI-APP Setup Guide



Ce projet est une application de gestion de projets avec une intégration de chatbot IA.



\## 1. File Structure \& Setup (Backend)

Ces configurations doivent être appliquées dans le dossier `backend-project/`.



\### .env (Configuration Locale - À NE PAS PARTAGER)

```env

APP\_NAME=Laravel

APP\_ENV=local

APP\_KEY=            # Lancer 'php artisan key:generate'

APP\_DEBUG=true

APP\_URL=http://localhost:8000

FRONTEND\_URL=http://localhost:4200



DB\_CONNECTION=mysql

DB\_HOST=127.0.0.1

DB\_PORT=3306

DB\_DATABASE=project\_management

DB\_USERNAME=root

DB\_PASSWORD=



JWT\_SECRET=         # Lancer 'php artisan jwt:secret'



GEMINI\_API\_KEY=     # Mettez votre propre clé API ici

GEMINI\_MODEL=gemini-2.5-flash

GOOGLE\_APPLICATION\_CREDENTIALS=storage/credentials/chatbot-service.json

