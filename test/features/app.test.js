const puppeteer = require('puppeteer');

let browser, page;

beforeEach(async done => {
  browser = await puppeteer.launch();
  page = await browser.newPage();
  await page.goto('http://localhost:3001/');
  done();
});

afterEach(() => {
  browser.close();
});

describe('Guess Vu', () => {
  describe('Homepage', () => {
    test('loads h1 with Guess Vu', async () => {
      const html = await page.$eval('#Home-title', e => e.innerHTML);
      expect(html).toBe('Guess Vu');
    });
  });

  describe('Chatroom messages input', () => {
    test('messages are displayed once sent', async () => {
      await page.waitForSelector('#Form');
      await page.click('input[name=fakeName]');
      await page.type('input[name=fakeName]', 'unicorn3');
      await page.click('input[name=realName]');
      await page.type('input[name=realName]', 'Vu3');
      await page.click('button[type=submit]');
      await page.waitForSelector('#messageInput');
      await page.click('input[name=message]');
      await page.type('input[name=message]', 'test message');
      await page.click('#messageSubmit');
      const html = await page.$eval('#messageDisplay', e => e.innerHTML);

      // user leaving so that next tests can run
      await page.waitForSelector('#leaveBtn');
      await page.click('#leaveBtn');

      expect(html).toEqual(expect.stringContaining('test message'));
    });
  });

  describe('Start game', () => {
    test('Displays: fake names, real names, guess button', async () => {

      // Needs to be changed after we reset the server for each test
      await page.waitForSelector('#Form');
      await page.click('input[name=fakeName]');
      await page.type('input[name=fakeName]', 'unicorn4');
      await page.click('input[name=realName]');
      await page.type('input[name=realName]', 'Vu4');
      await page.click('button[type=submit]');
      await page.waitForSelector('#startGame');
      await page.click('#startGame');
      await page.waitForSelector('#allRealNames');
      const htmlRealNames = await page.$eval('#allRealNames', e => e.innerHTML)
      const htmlFakeNames = await page.$eval('#allFakeNames', e => e.innerHTML);
      const htmlGuessing = await page.$eval('#guessing', e => e.innerHTML);

      // user leaving so that next tests can run
      await page.waitForSelector('#leaveBtn');
      await page.click('#leaveBtn');

      expect(htmlRealNames).toEqual(expect.stringContaining('Vu4'));
      expect(htmlFakeNames).toEqual(expect.stringContaining('unicorn4'));
      expect(htmlGuessing).toEqual(expect.stringContaining('Guess!'));
    });

  });

  describe('Name form', () => {
    test('redirects to chatroom after signup and greets with name', async () => {
      await page.waitForSelector('#Form');
      await page.click('input[name=fakeName]');
      await page.type('input[name=fakeName]', 'unicorn2');
      await page.click('input[name=realName]');
      await page.type('input[name=realName]', 'Vu2');
      await page.click('button[type=submit]');
      await page.waitForSelector('#chatRoom');
      const html = await page.$eval('#chatRoomTitle', e => e.innerHTML);

      // user leaving so that next tests can run
      await page.waitForSelector('#leaveBtn');
      await page.click('#leaveBtn');

      expect(html).toBe('Welcome unicorn2');
    });

    test('shows error message when fake and realname equal', async () => {
      await page.waitForSelector('#Form');
      await page.click('input[name=fakeName]');
      await page.type('input[name=fakeName]', 'unicorn5');
      await page.click('input[name=realName]');
      await page.type('input[name=realName]', 'unicorn5');
      await page.click('button[type=submit]');
      await page.waitForSelector('#signupError');
      const html = await page.$eval('#signupError', e => e.innerHTML);

      expect(html).toBe("Your fake name can't be your real name");
    });

    //Pending because this cannot work if noone has signed up under real name.
    //But we cannot leave users signed in because that breaks other tests.
    xtest('shows message when signing up with real name taken', async () => {
      await page.waitForSelector('.Form');
      await page.click('input[name=fakeName]');
      await page.type('input[name=fakeName]', 'unicorn2a');
      await page.click('input[name=realName]');
      await page.type('input[name=realName]', 'Vu6');
      await page.click('button[type=submit]');
      await page.waitForSelector('.signupError');
      const html = await page.$eval('.signupError', e => e.innerHTML);
      expect(html).toBe('This real name is already taken. Maybe add your last name?');
    })

  });

  describe('Guessing', () => {
    test('Incorrect guess', async () => {
      await page.waitForSelector('#Form');
      await page.click('input[name=fakeName]');
      await page.type('input[name=fakeName]', 'unicorn7');
      await page.click('input[name=realName]');
      await page.type('input[name=realName]', 'Vu7');
      await page.click('button[type=submit]');
      await page.waitForSelector('#startGame');
      await page.click('#startGame');
      await page.waitForSelector('#guessForm');
      await page.click('input[name=guessFakeName]');
      await page.type('input[name=guessFakeName]', 'unicorn1');
      await page.click('input[name=guessRealName]');
      await page.type('input[name=guessRealName]', 'Wrong guess');
      await page.click('#guessSubmit');
      await page.waitForSelector('#guessResult');
      const html = await page.$eval('#guessResult', e => e.innerHTML);

      // leave again so that other tests can run
      await page.waitForSelector('#leaveBtn');
      await page.click('#leaveBtn');

      expect(html).toEqual(expect.stringContaining('Sorry, not this time!'));
    });

    test('correct guess', async () => {
      //signup first person
      await page.waitForSelector('#Form');
      await page.click('input[name=fakeName]');
      await page.type('input[name=fakeName]', 'unicorn2');
      await page.click('input[name=realName]');
      await page.type('input[name=realName]', 'Vu2');
      await page.click('button[type=submit]');

      //signup second who guesses first
      await page.goto('http://localhost:3001/');
      await page.waitForSelector('#Form');
      await page.click('input[name=fakeName]');
      await page.type('input[name=fakeName]', 'unicorn6');
      await page.click('input[name=realName]');
      await page.type('input[name=realName]', 'Vu6');
      await page.click('button[type=submit]');
      await page.waitForSelector('#startGame');
      await page.click('#startGame');
      await page.waitForSelector('#guessForm');
      await page.click('input[name=guessFakeName]');
      await page.type('input[name=guessFakeName]', 'unicorn2');
      await page.click('input[name=guessRealName]');
      await page.type('input[name=guessRealName]', 'Vu2');
      await page.click('#guessSubmit');
      await page.waitForSelector('#guessResult');
      const html = await page.$eval('#guessResult', e => e.innerHTML);
      expect(html).toEqual(expect.stringContaining('You guessed correctly!'));
    });
  });

  describe('Start game2', () => {
    test('Cannot join if the game has started', async () => {
      await page.waitForSelector('#Form');
      await page.click('input[name=fakeName]');
      await page.type('input[name=fakeName]', 'unicorn9');
      await page.click('input[name=realName]');
      await page.type('input[name=realName]', 'Vu9');
      await page.click('button[type=submit]');
      await page.waitForSelector('#signupError');
      const html = await page.$eval('#signupError', e => e.innerHTML);
      expect(html).toEqual(expect.stringContaining('Sorry, you cannot join, the game has started.'));
    })
  });
});
