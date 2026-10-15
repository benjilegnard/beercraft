import { filesOfProject } from 'tsarch';
import { describe, expect, it } from 'vitest';

const project = () => filesOfProject('tsconfig.arch.json');

describe('architecture', () => {
  // Rule 3.1: cards stay dumb
  it('cards depend neither on clients nor on stores', async () => {
    const rule = project()
      .matchingPattern(String.raw`-card\.ts$`)
      .shouldNot()
      .dependOnFiles()
      .matchingPattern(String.raw`-(client|store)\.ts$`);
    expect(await rule.check()).toEqual([]);
  });

  // Rule 3.2: no state in ui
  it('ui does not depend on state', async () => {
    const rule = project().inFolder('ui').shouldNot().dependOnFiles().inFolder('state');
    expect(await rule.check()).toEqual([]);
  });

  // Rule 3.4: no cycles
  // inFolder() matches ONE folder name: inFolder('src/app') would match no file and always pass
  it('has no circular dependencies', async () => {
    const rule = project().inFolder('app').should().beFreeOfCycles();
    expect(await rule.check()).toEqual([]);
  });
});
