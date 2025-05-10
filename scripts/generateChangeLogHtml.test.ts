import { describe, it, expect } from 'vitest';
import generateChangeLogHtml from './generateChangeLogHtml';

describe('generateChangeLogHtml', () => {
  it('converts CHANGELOG.md to HTML and writes it to changelog.html', () => {
    const changeLogHtml = generateChangeLogHtml();
    expect(changeLogHtml).toContain('Changelog');
  });
});
