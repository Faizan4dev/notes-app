# Smart Notes

A modern React Native note-taking application built with Expo, featuring note management, search functionality, category organization, and AI-powered note summarization using Google's Gemini AI.

## Features

### Core Features

- Create Notes
- Edit Notes
- Delete Notes
- Search Notes
- Categorize Notes
- Persistent Local Storage using AsyncStorage

### Smart Features

- AI-Powered Note Summarization (Gemini AI)
- Smart Insights Dashboard
  - Total Notes
  - Most Used Category
  - Last Updated Note

### UI Features

- Modern and Responsive Design
- Smooth Animations using React Native Reanimated
- Clean User Experience
- Floating Action Button Navigation

## Technologies Used

- React Native
- Expo
- TypeScript
- Expo Router
- AsyncStorage
- React Native Reanimated
- Gemini API
- Lucide React Native Icons

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd smart-notes
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### Start Development Server

```bash
npm start
```

Or:

```bash
npx expo start
```

## Project Structure

```text
src/
├── app/
├── components/
├── context/
├── services/
│   └── gemini.ts
├── assets/
└── ...
```

## AI Summarization

The application uses Google's Gemini AI to generate concise summaries of lengthy notes. Users can open a note and click "Generate Summary" to receive key points extracted from the note content.

## Authors

Semester Project – Mobile Application Development
