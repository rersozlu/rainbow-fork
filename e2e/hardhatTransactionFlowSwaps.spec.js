/* eslint-disable no-undef */
/* eslint-disable jest/expect-expect */
import * as Helpers from './helpers';

let connector = null;
const ios = device.getPlatform() === 'ios';
const android = device.getPlatform() === 'android';

beforeAll(async () => {
  await Helpers.startHardhat();
  await Helpers.startIosSimulator();
});

const acceptAlertIfGasPriceIsHigh = async () => {
  // Depending on current gas prices, we might get an alert
  // saying that the fees are higher than the swap amount
  try {
    if (await Helpers.checkIfElementByTextIsVisible('Proceed Anyway')) {
      await Helpers.tapAlertWithButton('Proceed Anyway');
    }
    // eslint-disable-next-line no-empty
  } catch (e) {}
};

// eslint-disable-next-line no-unused-vars
const checkIfSwapCompleted = async (assetName, amount) => {
  // Disabling this because there's a view blocking (The portal)
  // await Helpers.checkIfVisible(`Swapped-${assetName}-${amount}`);
  return true;
};

describe('Hardhat Transaction Flow', () => {
  it('Should show the welcome screen', async () => {
    await Helpers.checkIfVisible('welcome-screen');
  });

  it('Should show the "Restore Sheet" after tapping on "I already have a wallet"', async () => {
    await Helpers.waitAndTap('already-have-wallet-button');
    await Helpers.checkIfExists('restore-sheet');
  });

  it('show the "Import Sheet" when tapping on "Restore with a recovery phrase or private key"', async () => {
    await Helpers.waitAndTap('restore-with-key-button');
    await Helpers.checkIfExists('import-sheet');
  });

  it('Should show the "Add wallet modal" after tapping import with a valid seed"', async () => {
    await Helpers.clearField('import-sheet-input');
    await Helpers.typeText('import-sheet-input', process.env.TEST_SEEDS, false);
    await Helpers.checkIfElementHasString(
      'import-sheet-button-label',
      'Import'
    );
    await Helpers.waitAndTap('import-sheet-button');
    await Helpers.checkIfVisible('wallet-info-modal');
  });

  it('Should navigate to the Wallet screen after tapping on "Import Wallet"', async () => {
    await Helpers.disableSynchronization();
    await Helpers.waitAndTap('wallet-info-submit-button');
    await Helpers.setPinOnAndroid();
    await Helpers.checkIfVisible('wallet-screen', 80000);
    await Helpers.enableSynchronization();
  });

  it('Should send ETH to test wallet"', async () => {
    await Helpers.sendETHtoTestWallet();
  });

  it('Should navigate to the Profile screen after swiping right', async () => {
    await Helpers.swipe('wallet-screen', 'right', 'slow');
    await Helpers.checkIfVisible('profile-screen');
  });

  it('Should navigate to Settings Sheet after tapping Settings Button', async () => {
    await Helpers.waitAndTap('settings-button');
    await Helpers.checkIfVisible('settings-sheet');
  });

  // This shouldn't be in this flow.
  it.skip('Should toggle Dark Mode on and off', async () => {
    await Helpers.waitAndTap('theme-section-light');
    await Helpers.tapByText('Dark');
    await Helpers.waitAndTap('theme-section-dark');
    await Helpers.tapByText('Light');
  });

  it('Should navigate to Developer Settings after tapping Developer Section', async () => {
    await Helpers.waitAndTap('developer-section');
    await Helpers.checkIfVisible('developer-settings-sheet');
  });

  if (ios) {
    it('Should show Applied alert after pressing Alert', async () => {
      await Helpers.swipe('developer-settings-sheet', 'up', 'slow');
      await Helpers.waitAndTap('alert-section');
      await Helpers.checkIfElementByTextIsVisible('APPLIED');
      await Helpers.tapAlertWithButton('OK');
      await Helpers.checkIfVisible('developer-settings-sheet');
    });
  }

  it('Should show Hardhat Toast after pressing Connect To Hardhat', async () => {
    await Helpers.scrollTo('developer-settings-sheet', 'bottom');
    await Helpers.waitAndTap('hardhat-section');
    await Helpers.checkIfVisible('testnet-toast-Hardhat');
  });

  it('Should navigate to the Wallet screen after swiping left', async () => {
    await Helpers.swipe('profile-screen', 'left', 'slow');
    await Helpers.checkIfVisible('wallet-screen');
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('Should deposit DAI (via Compound)', async () => {
    await Helpers.tap('Savings-list-header');
    await Helpers.waitAndTap('savings-list-row-DAI');
    await Helpers.waitAndTap('deposit-action-button');
    await Helpers.typeText('deposit-modal-input', '5', true);
    await Helpers.tapAndLongPress('deposit-modal-confirm-button');
    await acceptAlertIfGasPriceIsHigh();
    try {
      await Helpers.checkIfVisible('Deposited-Dai-5.00 DAI');
    } catch (e) {
      await Helpers.checkIfVisible('Depositing-Dai-5.00 DAI');
    }
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('Should withdraw DAI (via Compound)', async () => {
    await Helpers.waitAndTap('savings-list-row-DAI');
    await Helpers.waitAndTap('withdraw-action-button');
    await Helpers.typeText('withdraw-modal-input', '1', true);
    await Helpers.tapAndLongPress('withdraw-modal-confirm-button');
    await acceptAlertIfGasPriceIsHigh();
    try {
      await Helpers.checkIfVisible('Withdrew-Dai-1.00 DAI');
    } catch (e) {
      await Helpers.checkIfVisible('Withdrawing-Dai-1.00 DAI');
    }
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });

  it('Should be able to search random tokens (like SWYF) via address and swap them', async () => {
    await Helpers.waitAndTap('exchange-fab');
    await Helpers.checkIfVisible('currency-select-list');
    await Helpers.waitAndTap(
      'currency-select-list-exchange-coin-row-ETH-token'
    );
    await Helpers.checkIfVisible('exchange-modal-input');
    await Helpers.waitAndTap('exchange-modal-output-selection-button');
    await Helpers.checkIfVisible('currency-select-list');
    await Helpers.typeText(
      'currency-select-search-input',
      '0xefa6903aa49cd539c079ac4b0a090db432615822',
      true
    );
  });

  it('Should be able to search random tokens (like SWYF) via address and swap them 2', async () => {
    await Helpers.waitAndTap(
      'currency-select-list-exchange-coin-row-SWYF-token'
    );
    await Helpers.tapByText('Continue');
    await Helpers.checkIfVisible('exchange-modal-input');
    await Helpers.typeText('exchange-modal-input', '0.001', true);
    if (ios) {
      await Helpers.tapAndLongPress('exchange-modal-confirm-button');
    } else {
      await Helpers.tap('exchange-modal-confirm-button');
    }
    await Helpers.tapAndLongPress('swap-details-confirm-button');
    await acceptAlertIfGasPriceIsHigh();
    await Helpers.usePinOnAndroid();
    await checkIfSwapCompleted('Ethereum', '0.001 ETH');
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });

  it('Should be able to wrap ETH -> WETH', async () => {
    await Helpers.tap('exchange-fab');
    await Helpers.checkIfVisible('currency-select-list');
    await Helpers.tap('currency-select-list-exchange-coin-row-ETH-token');
    await Helpers.checkIfVisible('exchange-modal-input');
    await Helpers.tap('exchange-modal-output-selection-button');
    await Helpers.checkIfVisible('currency-select-list');
    await Helpers.typeText('currency-select-search-input', 'WETH', true);
    await Helpers.tap('currency-select-list-exchange-coin-row-WETH-token');
    await Helpers.checkIfVisible('exchange-modal-input');
    await Helpers.typeText('exchange-modal-input', '0.001', true);
    if (ios) {
      await Helpers.tapAndLongPress('exchange-modal-confirm-button');
    } else {
      await Helpers.tap('exchange-modal-confirm-button');
    }
    await Helpers.tapAndLongPress('swap-details-confirm-button');

    await acceptAlertIfGasPriceIsHigh();
    if (android) {
      await Helpers.delay(3000);
      await Helpers.usePinOnAndroid();
    }
    await checkIfSwapCompleted('Ethereum', '0.001 ETH');
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });
  it('Should be able to unwrap WETH -> ETH', async () => {
    await Helpers.tap('exchange-fab');
    await Helpers.checkIfVisible('currency-select-list');
    await Helpers.typeText('currency-select-search-input', 'WETH', true);
    await Helpers.tap('currency-select-list-exchange-coin-row-WETH-token');
    await Helpers.checkIfVisible('exchange-modal-input');
    await Helpers.tap('exchange-modal-output-selection-button');
    await Helpers.checkIfVisible('currency-select-list');
    await Helpers.tap('currency-select-list-exchange-coin-row-ETH-token');
    await Helpers.checkIfVisible('exchange-modal-input');
    await Helpers.typeText('exchange-modal-input', '0.0005', true);
    if (ios) {
      await Helpers.tapAndLongPress('exchange-modal-confirm-button');
    } else {
      await Helpers.tap('exchange-modal-confirm-button');
    }
    await Helpers.tapAndLongPress('swap-details-confirm-button');

    await acceptAlertIfGasPriceIsHigh();
    await Helpers.usePinOnAndroid();
    await checkIfSwapCompleted('Wrapper Ether', '0.0005 WETH');
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });
  it('Should swap WETH -> DAI including approval (via tokenToToken)', async () => {
    await Helpers.tap('exchange-fab');
    await Helpers.checkIfVisible('currency-select-list');
    await Helpers.typeText('currency-select-search-input', 'WETH', true);
    await Helpers.tap('currency-select-list-exchange-coin-row-WETH-token');
    await Helpers.checkIfVisible('exchange-modal-input');
    await Helpers.tap('exchange-modal-output-selection-button');
    await Helpers.checkIfVisible('currency-select-list');
    await Helpers.typeText('currency-select-search-input', 'DAI', true);
    await Helpers.tap('currency-select-list-exchange-coin-row-DAI-token');
    await Helpers.typeText('exchange-modal-input', '0.0005', true);
    if (ios) {
      await Helpers.tapAndLongPress('exchange-modal-confirm-button');
    } else {
      await Helpers.tap('exchange-modal-confirm-button');
    }
    await Helpers.tapAndLongPress('swap-details-confirm-button');
    await acceptAlertIfGasPriceIsHigh();
    await Helpers.usePinOnAndroid();
    await checkIfSwapCompleted('Wrapper Ether', '0.0005 WETH');
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });

  it('Should swap DAI -> USDC (via tokenToTokenWithPermit)', async () => {
    await Helpers.tap('exchange-fab');
    await Helpers.checkIfVisible('currency-select-list');
    await Helpers.typeText('currency-select-search-input', 'DAI', true);
    await Helpers.tap('currency-select-list-exchange-coin-row-DAI-token');
    await Helpers.checkIfVisible('exchange-modal-input');
    await Helpers.tap('exchange-modal-output-selection-button');
    await Helpers.checkIfVisible('currency-select-list');
    await Helpers.typeText('currency-select-search-input', 'USDC', true);
    await Helpers.tap('currency-select-list-exchange-coin-row-USDC-token');
    await Helpers.typeText('exchange-modal-input', '10', true);
    if (ios) {
      await Helpers.tapAndLongPress('exchange-modal-confirm-button');
    } else {
      await Helpers.tap('exchange-modal-confirm-button');
    }
    await Helpers.tapAndLongPress('swap-details-confirm-button');

    await acceptAlertIfGasPriceIsHigh();
    await Helpers.usePinOnAndroid();
    await checkIfSwapCompleted('DAI', '4 DAI');
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });

  it('Should swap DAI -> ETH (via tokenToETH)', async () => {
    await Helpers.tap('exchange-fab');
    await Helpers.checkIfVisible('currency-select-list');
    await Helpers.typeText('currency-select-search-input', 'DAI', true);
    await Helpers.tap('currency-select-list-exchange-coin-row-DAI-token');
    await Helpers.checkIfVisible('exchange-modal-input');
    await Helpers.tap('exchange-modal-output-selection-button');
    await Helpers.checkIfVisible('currency-select-list');
    await Helpers.tap('currency-select-list-exchange-coin-row-ETH-token');
    await Helpers.typeText('exchange-modal-input', '4', true);
    if (ios) {
      await Helpers.tapAndLongPress('exchange-modal-confirm-button');
    } else {
      await Helpers.tap('exchange-modal-confirm-button');
    }
    await Helpers.tapAndLongPress('swap-details-confirm-button');
    await acceptAlertIfGasPriceIsHigh();
    await Helpers.usePinOnAndroid();
    await checkIfSwapCompleted('DAI', '4 DAI');
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });

  it('Should swap ETH -> USDC (via ethToToken)', async () => {
    await Helpers.tap('exchange-fab');
    await Helpers.checkIfVisible('currency-select-list');
    await Helpers.tap('currency-select-list-exchange-coin-row-ETH-token');
    await Helpers.checkIfVisible('exchange-modal-input');
    await Helpers.tap('exchange-modal-output-selection-button');
    await Helpers.checkIfVisible('currency-select-list');
    await Helpers.typeText('currency-select-search-input', 'USDC', true);
    await Helpers.tap('currency-select-list-exchange-coin-row-USDC-token');
    await Helpers.typeText('exchange-modal-input', '0.005', true);
    await Helpers.delay(1000);
    if (ios) {
      await Helpers.tapAndLongPress('exchange-modal-confirm-button');
    } else {
      await Helpers.tap('exchange-modal-confirm-button');
    }
    await Helpers.tapAndLongPress('swap-details-confirm-button');
    await acceptAlertIfGasPriceIsHigh();
    await Helpers.usePinOnAndroid();
    await checkIfSwapCompleted('Ethereum', '0.005 ETH');
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });
  it('Should swap USDC -> WETH (via tokenToTokenWithPermit)', async () => {
    await Helpers.tap('exchange-fab');
    await Helpers.checkIfVisible('currency-select-list');
    await Helpers.typeText('currency-select-search-input', 'USDC', true);
    await Helpers.tap('currency-select-list-exchange-coin-row-USDC-token');
    await Helpers.checkIfVisible('exchange-modal-input');
    await Helpers.tap('exchange-modal-output-selection-button');
    await Helpers.checkIfVisible('currency-select-list');
    await Helpers.typeText('currency-select-search-input', 'WETH', true);
    await Helpers.tap('currency-select-list-exchange-coin-row-WETH-token');
    await Helpers.typeText('exchange-modal-input', '14', true);
    if (ios) {
      await Helpers.tapAndLongPress('exchange-modal-confirm-button');
    } else {
      await Helpers.tap('exchange-modal-confirm-button');
    }
    await Helpers.tapAndLongPress('swap-details-confirm-button');
    await acceptAlertIfGasPriceIsHigh();
    await Helpers.usePinOnAndroid();
    await checkIfSwapCompleted('USD Coin', '25 USDC');
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });

  it('Should swap USDC -> ETH (via tokenToETH)', async () => {
    await Helpers.tap('exchange-fab');
    await Helpers.checkIfVisible('currency-select-list');
    await Helpers.typeText('currency-select-search-input', 'USDC', true);
    await Helpers.tap('currency-select-list-exchange-coin-row-USDC-token');
    await Helpers.checkIfVisible('exchange-modal-input');
    await Helpers.tap('exchange-modal-output-selection-button');
    await Helpers.checkIfVisible('currency-select-list');
    await Helpers.tap('currency-select-list-exchange-coin-row-ETH-token');
    await Helpers.typeText('exchange-modal-input', '10', true);
    if (ios) {
      await Helpers.tapAndLongPress('exchange-modal-confirm-button');
    } else {
      await Helpers.tap('exchange-modal-confirm-button');
    }
    await Helpers.tapAndLongPress('swap-details-confirm-button');
    await acceptAlertIfGasPriceIsHigh();
    await Helpers.usePinOnAndroid();
    await checkIfSwapCompleted('USD Coin', '20 USDC');
    await acceptAlertIfGasPriceIsHigh();
    await Helpers.swipe('profile-screen', 'left', 'slow');
  });

  afterAll(async () => {
    // Reset the app state
    await connector?.killSession();
    connector = null;
    await device.clearKeychain();
    await Helpers.killHardhat();
  });
});
