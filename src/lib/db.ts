import { marked } from "marked";

export function getChapterData(chapter: string) {
    // Placeholder function to simulate fetching chapter data from a database
    return {
        chapter: chapter,
        title: `Chapter ${chapter}`,
        content: `This is the content of chapter ${chapter}.`,
        meta: `This is some meta information about chapter ${chapter}.`
    };
}