import { test, expect } from '@playwright/test';
const { chromium, firefox } = require('playwright');

//operator locators
const bttnToLogin = '[data-test-id="button-to-login"]'
const loginUsernameInput = '[data-test-id="login-username-input"]'
const loginPwdInput = '[data-test-id="login-password-input"]'
const loginBttn = '[data-test-id="button-to-submit-login-form"]'

//customer locators
const mssgrButton = 'iframe[title="Messenger button"]'
const messenger = 'iframe[title="Messenger"]'

const mssg = 'hello'

test('test name', async ({ }) => {
  const browser1 = await chromium.launch();
  const context1 = await browser1.newContext();

  const browser2 = await firefox.launch();
  const context2 = await browser2.newContext();

  const operator = await context1.newPage();
  const customer = await context2.newPage();

  // operators browser
  await operator.goto('https://www.userlike.com/');
  await operator.locator(bttnToLogin).click();
  await operator.locator(loginUsernameInput).click();
  await operator.locator(loginUsernameInput).fill('******');
  await operator.locator(loginPwdInput).click();
  await operator.locator(loginPwdInput).fill('******');
  await operator.locator(loginBttn).click();
  await operator.getByRole('link', { name: 'Message Center', exact: true }).click();

  // customers browser
  await customer.goto('https://www.userlike.com/de/um/debug/153160');
  await customer.frameLocator(mssgrButton).getByLabel('Open').click();
  await customer.frameLocator(messenger).getByRole('button', { name: 'Neue Unterhaltung starten' }).click();
  await customer.frameLocator(messenger).getByPlaceholder('Ihre Nachricht').click();
  await customer.frameLocator(messenger).getByPlaceholder('Ihre Nachricht').fill(mssg);
  await customer.frameLocator(messenger).locator('.frame-1d7d2m0 > button:nth-child(2)').click();

  // checking that message was sended with ui
  await expect(customer.frameLocator(messenger).locator('div').filter({ hasText: mssg }).locator('div').first()).toBeVisible();

  // checking that response code is OK after sending mssg
  const customerResponse = await customer.waitForResponse('https://api.userlike.com/api/um/chat/handle/');
  if (customerResponse.status() === 200) {
    console.log('status 200 OK.');
  } else {
    console.log('wrong status: ' + customerResponse.status());
  }

  // checing operator gets the message
  await expect(operator.getByText("Live (1)")).toBeVisible();
  await expect(operator.getByText(mssg).first()).toBeVisible()
  await operator.getByText(mssg).first().click()
  await expect(operator.locator('.umc-16r6bns').filter({ hasText: mssg })).toBeVisible()

  // send response
  await operator.getByRole('textbox').first().fill(mssg + " " + mssg);
  await operator.getByLabel('Nachricht senden').click();

  // check message was sended
  await expect(operator.locator('.umc-16r6bns').filter({ hasText: mssg + " " + mssg })).toBeVisible()

  // checking that response code is OK after sending mssg
    // didn't found endpoint to check

  // checking customer gets the message
  await expect (customer.frameLocator(messenger).locator('p').filter({ hasText: mssg + " " + mssg })).toBeVisible()

  // close conversation
  await operator.locator('div:nth-child(5) > .e1968bfk0').click();
  
  // check that live tab is empty after closing conversation
  await expect(operator.getByText("Live (0)")).toBeVisible();

  await browser1.close();
  await browser2.close();
});

  