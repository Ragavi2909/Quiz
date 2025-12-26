# Quiz creation and sharing

Quizzes created by users are stored in MongoDB and are accessible via API endpoints. When you create a quiz via the frontend, the backend returns a `shareId` that can be used to share the quiz at the route `/quiz/shared/{shareId}`. The backend also exposes `/api/quizzes/shared/:shareId` to fetch the quiz data by the `shareId` and increments the quiz `plays` counter when accessed.

If quizzes don't appear under topics, verify that the backend is running, the database is seeded (the server executes an `initializeTopics()` function on start), and confirm the frontend is requesting the correct API URL.
