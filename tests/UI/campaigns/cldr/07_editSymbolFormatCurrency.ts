// Import utils
import helper from '@utils/helpers';
import testContext from '@utils/testContext';

// Import commonTests
import loginCommon from '@commonTests/BO/loginBO';

// Import pages
import dashboardPage from '@pages/BO/dashboard';
import localizationPage from '@pages/BO/international/localization';
import currenciesPage from '@pages/BO/international/currencies';
import addCurrencyPage from '@pages/BO/international/currencies/add';

// Import data
import Currencies from '@data/demo/currencies';

import {use, expect} from 'chai';
import chaiString from 'chai-string';
import type {BrowserContext, Page} from 'playwright';

use(chaiString);

const baseContext: string = 'cldr_editSymbolFormatCurrency';

describe('CLDR : Edit symbol / format currency', async () => {
  let browserContext: BrowserContext;
  let page: Page;
  let numberOfCurrencies: number;

  const customSymbol: string = '@';

  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);
  });

  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });

  it('should login in BO', async function () {
    await loginCommon.loginBO(this, page);
  });

  it('should go to \'International > Localization\' page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToLocalizationPage', baseContext);

    await dashboardPage.goToSubMenu(
      page,
      dashboardPage.internationalParentLink,
      dashboardPage.localizationLink,
    );
    await localizationPage.closeSfToolBar(page);

    const pageTitle = await localizationPage.getPageTitle(page);
    await expect(pageTitle).to.contains(localizationPage.pageTitle);
  });

  it('should go to Currencies Tab', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToCurrenciesTab0', baseContext);

    await localizationPage.goToSubTabCurrencies(page);

    const pageTitle = await currenciesPage.getPageTitle(page);
    await expect(pageTitle).to.contains(currenciesPage.pageTitle);
  });

  it('should reset all filters', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'resetFilter0', baseContext);

    numberOfCurrencies = await currenciesPage.resetAndGetNumberOfLines(page);
    await expect(numberOfCurrencies).to.be.above(0);
  });

  it(`should filter by iso code of currency '${Currencies.euro.isoCode}'`, async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'filterToEurCurrency0', baseContext);

    // Filter
    await currenciesPage.filterTable(page, 'input', 'iso_code', Currencies.euro.isoCode);

    // Check number of currencies
    const numberOfCurrenciesAfterFilter = await currenciesPage.getNumberOfElementInGrid(page);
    await expect(numberOfCurrenciesAfterFilter).to.be.equal(1);

    // Check currency created
    const textColumn = await currenciesPage.getTextColumnFromTableCurrency(page, 1, 'iso_code');
    await expect(textColumn).to.contains(Currencies.euro.isoCode);
  });

  it(`should edit the currency '${Currencies.euro.isoCode}'`, async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToEuroCurrencyPage0', baseContext);

    await currenciesPage.goToEditCurrencyPage(page, 1);

    const pageTitle = await addCurrencyPage.getPageTitle(page);
    await expect(pageTitle).to.contains(addCurrencyPage.pageTitleEdit(Currencies.euro.name));
  });

  it('should have multiples currencies formats', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'checkMultipleFormats', baseContext);

    const numberCurrencyFormats = await addCurrencyPage.getNumberOfElementInGrid(page);
    await expect(numberCurrencyFormats).to.be.gt(0);
  });

  it('should edit the first currency format and open a modal', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'editCurrencyFormat', baseContext);

    const isModalVisible = await addCurrencyPage.editCurrencyFormat(page, 1);
    await expect(isModalVisible).to.be.true;
  });

  it(`should update the symbol by ${customSymbol} & the format`, async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'updateCurrencyFormat', baseContext);

    await addCurrencyPage.setCurrencyFormatSymbol(page, customSymbol);
    await addCurrencyPage.setCurrencyFormatFormat(page, 'rightWithSpace');
    await addCurrencyPage.saveCurrencyFormat(page);

    const exampleFormat = await addCurrencyPage.getTextColumnFromTable(page, 1, 2);
    await expect(exampleFormat).to.endWith(` ${customSymbol}`);
  });

  it('should reset the currency format', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'resetCurrencyFormat', baseContext);

    const growlMessage = await addCurrencyPage.resetCurrencyFormat(page, 1);
    await expect(growlMessage).to.be.eq(addCurrencyPage.resetCurrencyFormatMessage);

    const exampleFormat = await addCurrencyPage.getTextColumnFromTable(page, 1, 2);
    await expect(exampleFormat).to.startWith(Currencies.euro.symbol);
  });

  [1, 2].forEach((numRow: number) => {
    it(`should edit the currency format #${numRow} and open a modal`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', `editCurrencyFormat${numRow}`, baseContext);

      const isModalVisible = await addCurrencyPage.editCurrencyFormat(page, numRow);
      await expect(isModalVisible).to.be.true;
    });

    it(`should update the symbol by ${customSymbol} and the format`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', `updateCurrencyFormat${numRow}`, baseContext);

      await addCurrencyPage.setCurrencyFormatSymbol(page, customSymbol);
      await addCurrencyPage.setCurrencyFormatFormat(page, 'rightWithSpace');
      await addCurrencyPage.saveCurrencyFormat(page);

      const exampleFormat = await addCurrencyPage.getTextColumnFromTable(page, numRow, 2);
      await expect(exampleFormat).to.endWith(` ${customSymbol}`);
    });
  });

  it('should update the currency', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'resetCurrency0', baseContext);

    const result = await addCurrencyPage.saveCurrencyForm(page);
    await expect(result).to.be.eq(currenciesPage.successfulUpdateMessage);

    const symbolCurrency = await currenciesPage.getTextColumnFromTableCurrency(page, 1, 'symbol');
    await expect(symbolCurrency).to.be.eq(customSymbol);
  });

  it(`should edit the currency '${Currencies.euro.isoCode}'`, async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToEuroCurrencyPage1', baseContext);

    await currenciesPage.goToEditCurrencyPage(page, 1);

    const pageTitle = await addCurrencyPage.getPageTitle(page);
    await expect(pageTitle).to.contains(addCurrencyPage.pageTitleEdit(Currencies.euro.name));
  });

  it('should restore default settings\'', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'restoreDefaultSettings', baseContext);

    const modalRestore = await addCurrencyPage.restoreDefaultSettings(page);
    await expect(modalRestore).to.be.true;
  });

  // @todo : Enable when https://github.com/PrestaShop/PrestaShop/issues/31812 is fixed
  it.skip('should check the restoration is done', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'checkRestorationDone', baseContext);

    const exampleFormatRow1 = await addCurrencyPage.getTextColumnFromTable(page, 1, 2);
    await expect(exampleFormatRow1).to.startWith(customSymbol);

    const exampleFormatRow2 = await addCurrencyPage.getTextColumnFromTable(page, 2, 2);
    await expect(exampleFormatRow2).to.endWith(` ${customSymbol}`);
  });

  // @todo : Remove when https://github.com/PrestaShop/PrestaShop/issues/31812 is fixed
  it('should edit the currency format #1 and open a modal', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'checkRestorationDoneBypass0', baseContext);

    const isModalVisible = await addCurrencyPage.editCurrencyFormat(page, 1);
    await expect(isModalVisible).to.be.true;
  });

  // @todo : Remove when https://github.com/PrestaShop/PrestaShop/issues/31812 is fixed
  it(`should update the symbol by ${Currencies.euro.symbol} and the format`, async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'checkRestorationDoneBypass1', baseContext);

    await addCurrencyPage.setCurrencyFormatSymbol(page, Currencies.euro.symbol);
    await addCurrencyPage.setCurrencyFormatFormat(page, 'leftWithoutSpace');
    await addCurrencyPage.saveCurrencyFormat(page);

    const exampleFormat = await addCurrencyPage.getTextColumnFromTable(page, 1, 2);
    await expect(exampleFormat).to.startWith(Currencies.euro.symbol);
  });

  // @todo : Remove when https://github.com/PrestaShop/PrestaShop/issues/31812 is fixed
  it('should edit the currency format #2 and open a modal', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'checkRestorationDoneBypass2', baseContext);

    const isModalVisible = await addCurrencyPage.editCurrencyFormat(page, 2);
    await expect(isModalVisible).to.be.true;
  });

  // @todo : Remove when https://github.com/PrestaShop/PrestaShop/issues/31812 is fixed
  it(`should update the symbol by ${Currencies.euro.symbol} and the format`, async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'checkRestorationDoneBypass3', baseContext);

    await addCurrencyPage.setCurrencyFormatSymbol(page, Currencies.euro.symbol);
    await addCurrencyPage.setCurrencyFormatFormat(page, 'rightWithSpace');
    await addCurrencyPage.saveCurrencyFormat(page);

    const exampleFormat = await addCurrencyPage.getTextColumnFromTable(page, 2, 2);
    await expect(exampleFormat).to.endWith(` ${Currencies.euro.symbol}`);
  });

  it('should update the currency', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'resetCurrency1', baseContext);

    const result = await addCurrencyPage.saveCurrencyForm(page);
    await expect(result).to.be.eq(currenciesPage.successfulUpdateMessage);

    const symbolCurrency = await currenciesPage.getTextColumnFromTableCurrency(page, 1, 'symbol');
    await expect(symbolCurrency).to.be.eq(Currencies.euro.symbol);
  });

  it('should reset all filters', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'resetFilter1', baseContext);

    numberOfCurrencies = await currenciesPage.resetAndGetNumberOfLines(page);
    await expect(numberOfCurrencies).to.be.above(0);
  });
});
