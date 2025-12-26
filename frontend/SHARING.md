# Sharing quizzes

After creating a quiz from the Create screen, the UI shows a shareable link and a QR code you can scan from a mobile device. The link points to `/quiz/shared/{shareId}` and can be copied or scanned to let others take the quiz.

If the QR doesn't render, ensure you've installed dependencies (see `README.md` Setup) and that the frontend can access the backend API at the value set in `NEXT_PUBLIC_API_URL`.

To view a quiz by share id in the browser, open:

```
http://localhost:3000/quiz/shared/<shareId>
```
