# PPG Recitation Quest

A classroom-ready, no-repeat oral recitation drawer for **Philippine Political History**.

## Included
- 35 active learners from the accomplished August SF2 sheet
- 75 questions with concise answer key
- Exactly 2 unique questions per completed learner
- No question repetition across learners
- Manual or random learner selection
- Teacher Mode to reveal answers
- Undo, session reset, CSV history export, and automatic local saving
- Responsive layout for laptop, projector, tablet, or phone

## Deploy to Netlify
### Option 1: Drag and drop
1. Extract this repository.
2. Sign in to Netlify.
3. Open **Add new site > Deploy manually**.
4. Drag the whole `ppg-oral-recit` folder into the upload area.

### Option 2: GitHub
1. Create a new GitHub repository.
2. Upload all files from this folder to the repository root.
3. In Netlify, choose **Add new site > Import an existing project**.
4. Connect GitHub and select the repository.
5. No build command is needed. The publish directory is `.`

## Local use
Open `index.html` in a modern browser. Internet access is not required after the files are downloaded.

## Important behavior
Progress is stored in the browser using `localStorage`. It stays on the same device and browser until **Reset Session** is used or browser storage is cleared.
