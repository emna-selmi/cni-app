\# CNI-APP Setup Guide



Ce projet est une application de gestion de projets avec une intégration de chatbot IA.



\## 1. File Structure \& Setup (Backend)

Ces configurations doivent être appliquées dans le dossier `backend-project/`.



\### .env (Local Configuration)

```env

APP\_NAME=Laravel

APP\_ENV=local

APP\_KEY=base64:SPSf45HJIoKBjp872Gyu7nCwPM/6z6YJ9oC7MMObLcA=

APP\_DEBUG=true

APP\_URL=http://localhost:8000

FRONTEND\_URL=http://localhost:4200



DB\_CONNECTION=mysql

DB\_HOST=127.0.0.1

DB\_PORT=3306

DB\_DATABASE=project\_management

DB\_USERNAME=root

DB\_PASSWORD=



JWT\_SECRET=wFWIsaWyf81P7fuOgr2Tl4FnUQ6PekRL5WW4HyK7HNEBYuvBqt3AYxIjmeDvqzLO



GEMINI\_API\_KEY=AIzaSyAYJlwH\_UfBAFecoKWnY42HagbjwzFau1M

GEMINI\_MODEL=gemini-2.5-flash

GOOGLE\_APPLICATION\_CREDENTIALS=storage/credentials/chatbot-service.json

