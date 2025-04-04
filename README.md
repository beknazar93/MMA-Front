# 🥋 MMA CRM Frontend

Фронтенд-часть CRM-системы для управления заявками, клиентами и сотрудниками в спортивной сфере (или ты просто любишь брутальные аббревиатуры — мы не осуждаем).

## ⚙️ Стек технологий

- React
- React Router
- SCSS / CSS Modules
- Axios
- Vite или Create React App (в зависимости от текущей настройки)
- API взаимодействие с [CRM Backend](https://github.com/beknazar93/CRM)

## 🚀 Запуск проекта

1. Установи зависимости:

```bash
npm install
Запусти проект в режиме разработки:

bash
Копировать
Редактировать
npm start
Открой браузер по адресу:

arduino
Копировать
Редактировать
http://localhost:3000
Проект будет автоматически обновляться при изменениях в коде.

📁 Структура
bash
Копировать
Редактировать
src/
├── components/        # Переиспользуемые UI-компоненты
├── pages/             # Страницы приложения
├── services/          # Axios-инстансы и API-запросы
├── assets/            # Иконки, изображения и стили
├── App.js             # Главный компонент
└── index.js           # Точка входа
🔌 Интеграция с бекендом
Проект обращается к REST API, развернутому на Django. Все запросы сконфигурированы в services/api.js. Убедись, что бекенд запущен и доступен по нужному адресу (например, http://localhost:8000).

🛠 Команды разработчика
bash
Копировать
Редактировать
npm run build      # Сборка production-версии
npm run lint       # Проверка линтинга (если настроено)
npm test           # Запуск тестов (если будет желание)
💡 Автор
Этот интерфейс был собран вручную и с минимальной болью:
beknazar93
