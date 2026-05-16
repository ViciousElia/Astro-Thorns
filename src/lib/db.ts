import { date } from 'astro:schema';
import { readFile, writeFile, readdir } from 'fs/promises';
import matter from 'gray-matter';
import { marked } from 'marked';
import { parse } from 'path';

// Enable WAL mode for concurrent reads
let db : {
  validation: {
    length: number;
    date_time: string;
  }
  arcs: {
    title: string;
    books: string[];
  }[];
  files: {
    title: string;
    path: string;
    date: string;
    local_part: number;
    global_part: number;
    book: string;
    arc: string;
  }[];
}

const DB_PATH = 'public/db.json'
const CHAPTERS_DIR = 'public/narratives'

export async function getChapterData(chapter: string) {
  if (!db) await loadDB();

  if (db && db.arcs && db.files) {
    let targetChapter = parseInt(chapter);
    const validFiles = db.files
      .filter(file => new Date(file.date).getTime() <= new Date().getTime())
      .sort((a,b)=>{return b.global_part - a.global_part});
    if (validFiles.length === 0) { return {} }
    if (isNaN(targetChapter) || targetChapter>validFiles[0].global_part) targetChapter = validFiles[0].global_part;
    if (targetChapter<0) targetChapter = 0;
    let goalFile = validFiles.find(file => file.global_part === targetChapter);
    if (!goalFile) {
      goalFile = validFiles.reduce((prev, curr) => {
        return (Math.abs(curr.global_part - targetChapter) < Math.abs(prev.global_part - targetChapter) ? curr : prev);
      });
    }
    targetChapter = goalFile.global_part;
    try {
      const fileContent = await readFile(goalFile.path, 'utf-8');
      const { data, content } = matter(fileContent);
      const arcNumber = db.arcs.findIndex(arc => arc.title === data.arc);
      const bookNumber = db.arcs[arcNumber].books.findIndex(book => book === data.book);
      return {
        chapter: targetChapter,
        title: data.title || '',
        content: marked(content),
        meta: data.description || '',
        date: data.date_published || '',
        place: (arcNumber+1) + '-' + (bookNumber+1) + '-' + data.chapter_number,
        arc: data.arc || '',
        book: data.book || ''
      };
    } catch (err) {
      console.log('Error reading chapter file:', err);
    }
  }
  // Placeholder function to simulate fetching chapter data from a database
  return {
      chapter: chapter,
      title: `Chapter ${chapter}`,
      content: `This is the content of chapter ${chapter}.`,
      meta: `This is some meta information about chapter ${chapter}.`,
      date: new Date().toISOString(),
      place: '0-0-'+chapter
  };
}

async function loadDB() {
  if (!db){
    try {
      const data = await readFile(DB_PATH, 'utf-8');
      db = JSON.parse(data);
    } catch (err) {
      console.log('Error loading DB:', err, 'Rebuilding DB...');
    }
  }
  if (!db) await rebuildDB();
  else if (!db.validation || !db.validation.date_time || !db.validation.length) await rebuildDB();
  else if (new Date(db.validation.date_time).getTime() < Date.now() - 120 * 60 * 60 * 1000) await rebuildDB();
  else if (db.validation.length === 0) await rebuildDB();

  return db;
}

async function rebuildDB() {
  db = {
    validation: {
      length: 0,
      date_time: new Date().toISOString()
    },
    arcs: [
      { title: 'Of Leafs and Thorns', books: ['The Blue and Silver Rose','The Tower of Snow and Wind','The Heroine, Haunted and Holy'] },
      { title: 'Of Root and Branch', books: ['The Source','The Fork','The Merge'] }
    ],
    files: []
  };
  const fileList = await traverseDirectory(CHAPTERS_DIR);

  if (fileList.length===0) {console.log('No files found in CHAPTERS_DIR'); return;}

  for (const filePath of fileList) {
    try {
      const fileContent = await readFile(filePath, 'utf-8');
      const { data } = matter(fileContent);

      const fileInfo = {
        title: data.title || '',
        path: filePath,
        date: data.date_published || '',
        local_part: data.chapter_number || 0,
        global_part: data.global_part || 0,
        book: data.book || '',
        arc: data.arc || ''
      };
      db.files.push(fileInfo);
    } catch (err) {
      console.log('Error processing file:', filePath, err);
    }
  }
  db.validation.length = db.files.length;
  db.validation.date_time = new Date().toISOString();
  db.files.sort((a, b) => {return b.global_part - a.global_part});

  try {
    await writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.log('Error saving DB:', err);
  }
}

async function traverseDirectory(dir: string, baseDir = dir) {
  const results:string[] = []

  try {
    const files = await readdir(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = `${dir}/${file.name}`;
      if (file.isDirectory()) {
        const subResults = await traverseDirectory(fullPath);
        results.push(...subResults);
      } else if (file.isFile() && file.name.endsWith('.md')) {
        results.push(fullPath);
      }
    }
  } catch (err) {
    console.log('Error traversing directory:', err);
  }

  return results;
}