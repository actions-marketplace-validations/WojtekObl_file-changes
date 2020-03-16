import { Env, p } from './mocks/env/env'
let env:Env // env object

describe.each(p.testEvents)('Testing %s event...', event => {
  beforeAll(() => env = new Env({}, {githubToken: 'TestToken'}, event))
  afterEach(() => {
    process.env = {...env.envStart}
    jest.resetModules()
    env = new Env({}, {}, event)
  })
  describe('...with function initClientTests...', () => {
    it.each(p.getTestEvents(p.initClientTestInputs, event))
      ('%s', (title, input, expected) => {
        let gh = require('../src/GithubHelper').initClient(input)
        let GitHub = require('@actions/github').GitHub
        expect(GitHub).toHaveBeenCalledTimes(1)
        expect(GitHub).toHaveBeenCalledWith(expected)
        expect(gh).toEqual(env.octokitMock)
      })
  })
  describe.each([['getChangedPRFiles', p.getChangedPRFilesTestInputs], ['getChangedPushFiles', p.getChangedPushFilesTestInputs], ['getChangedFiles', p.getChangedFilesTestInputs]])
  ('...with function %s...', (method, inputs) => {
    it.each(p.getTestEvents(inputs, event))
    ('...it %s', async (title, input, expected) => {
      if (title.includes('throws an error')) {
        expect.assertions(1);
        if (method === 'getChangedPRFiles') await expect(require('../src/GithubHelper').getChangedPRFiles(env.githubMock, input.repo, input.owner, input.pullNumber)).rejects.toThrowErrorMatchingSnapshot()
        else if (method === 'getChangedPushFiles') await expect(require('../src/GithubHelper').getChangedPushFiles(env.githubMock, input.repo, input.owner, input.before, input.after)).rejects.toThrowErrorMatchingSnapshot()
        else if (method === 'getChangedFiles') await expect(require('../src/GithubHelper').getChangedFiles(env.githubMock, input.repo, { ...input })).rejects.toThrowErrorMatchingSnapshot()
      } else {
        let files: any[] = []
        if (method === 'getChangedPRFiles') files = await require('../src/GithubHelper').getChangedPRFiles(env.githubMock, input.repo, input.owner, input.pullNumber)
        else if (method === 'getChangedPushFiles') files = await require('../src/GithubHelper').getChangedPushFiles(env.githubMock, input.repo, input.owner, input.before, input.after)
        else if (method === 'getChangedFiles') files = await require('../src/GithubHelper').getChangedFiles(env.githubMock, input.repo, { ...input })
        expect(files).toStrictEqual(expected)
        expect(files.length).toBe(7)
      }
    })
  })
})