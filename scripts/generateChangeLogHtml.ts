import { readFileSync } from 'fs';
import { resolve } from 'path';
import showdown from 'showdown';

export default function generateChangeLogHtml(): string {
  const changeLogMd = readFileSync(resolve(__dirname, '../CHANGELOG.md'), 'utf-8');
  const converter = new showdown.Converter({ openLinksInNewWindow: true });
  const changeLogHtml = converter.makeHtml(changeLogMd);

  return changeLogHtml;
}
