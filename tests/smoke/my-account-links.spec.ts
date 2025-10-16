import { BrowserContext, Locator, Page } from '@playwright/test';
import { expect, test } from '../../fixtures/custom-fixtures';
import { testUsers } from '../../fixtures/test-data';
import { LoginPage } from '../../page-objects/pages/LoginPage';

test.describe('My Account Links - Smoke Test', () => {

    test.describe.configure({ mode: 'serial' });

    let sharedContext: BrowserContext;
    let sharedPage: Page;

    // Authenticate once before all tests and keep the context alive
    test.beforeAll(async ({ browser }) => {
        sharedContext = await browser.newContext();
        sharedPage = await sharedContext.newPage();
        const loginPage = new LoginPage(sharedPage);
        
        await loginPage.goto();
        await loginPage.login(testUsers.validUser.username, testUsers.validUser.password);
        await sharedPage.waitForURL(/\/cwa\/en\/USD\/?$/);
    });
    
    // Clean up the shared context after all tests
    test.afterAll(async () => {
        await sharedContext?.close();
    });
    
    // Override the page fixture to use our shared authenticated page
    test.use({
        page: async ({}, use) => {
            await use(sharedPage);
        }
    });

    // Expected My Account dropdown items data
    const EXPECTED_MENU_ITEMS = [
        { text: 'Account Overview', href: '/cwa/en/USD/my-account/update-profile'},
        { text: 'Sales Orders', href: '/cwa/en/USD/my-account/orders'},
        { text: 'Return Orders', href: '/cwa/en/USD/my-account/return-orders'},
        { text: 'Payment History', href: '/cwa/en/USD/my-account/payment-history'},
        { text: 'Transactions / Bill Pay', href: '/cwa/en/USD/my-account/invoices'},
        { text: 'My Deliveries', href: '/cwa/en/USD/my-account/deliveries'},
        { text: 'Wishlist', href: '/cwa/en/USD/my-account/wishlist'},
        { text: 'Change Password', href: '/cwa/en/USD/my-account/update-password'},
        { text: 'Consent Management', href: '/cwa/en/USD/my-account/consents'},
        { text: 'Service Portal', href: '/cwa/en/USD/service-portal/service-requests'},
        { text: 'My Coupons', href: '/cwa/en/USD/my-account/coupons'},
        { text: 'Notification Preference', href: '/cwa/en/USD/my-account/notification-preference'},
        { text: 'Logout', href: '/cwa/en/USD/logout'},
    ];

    //Verify that navigation items are in correct order
    async function verifyNavigationOrder(
        linksLocator: Locator,
        expectedItems: Array<{ text: string; href: string }>
    ): Promise<void> {
        const links = await linksLocator.all();
        const actualTexts = await Promise.all(
            links.map(async (link) => {
                const text = await link.textContent();
                return text?.trim().replace(/\s+/g, ' ') || '';
            })
        );
        const actualHrefs = await Promise.all(
            links.map(link => link.getAttribute('href'))
        );
        
        const expectedTexts = expectedItems.map(item => item.text);
        const expectedHrefs = expectedItems.map(item => item.href);
        
        // Verify text order matches
        expect(actualTexts).toEqual(expectedTexts);
        
        // Verify href order matches
        expect(actualHrefs).toEqual(expectedHrefs);
    }

    test('should display My Account dropdown with all required navigation links', async ({ page, homePage }) => {
        //Navigate to homepage
        await homePage.goto();
        
        const myAccountButton = page.locator('cw-navigation-ui button[aria-label="My Account"]');
        const dropdownWrapper = page.locator('cw-navigation-ui .wrapper');
        const navigation = page.locator('cw-navigation-ui nav[aria-label="My Account"]');

        await test.step('Open My Account dropdown', async() => {
            await expect(myAccountButton).toBeVisible();
            await myAccountButton.click();
            await expect(dropdownWrapper).toBeVisible();
        });

        await test.step('Verify all required navigation links are present', async() => {
            const linkVerification = EXPECTED_MENU_ITEMS.map(async (menuItem) => {
                const link = page.locator(`cw-navigation-ui .childs cx-generic-link a[href="${menuItem.href}"]`);  
                await expect(link).toBeVisible();
                await expect(link).toHaveText(menuItem.text);
                await expect(link).toHaveAttribute('href', menuItem.href);
            });
            await Promise.all(linkVerification);             
        });

        await test.step('Verify navigation items are in correct order', async() => {
            const navLinks = page.locator('cw-navigation-ui .childs cx-generic-link a');
            await verifyNavigationOrder(navLinks, EXPECTED_MENU_ITEMS);
        });

        await test.step('Close dropdown', async () => {
            await myAccountButton.click();
            await expect(myAccountButton).toHaveAttribute('aria-expanded', 'false');
        });
    });

    test('should display My Account navigation bar with all links after navigating to Account Overview', async ({ page, homePage }) => {
        // For a company admin expected navigation items including the additional "My Company" link
        // const EXPECTED_NAV_ITEMS = [
        //     { text: 'My Company', href: '/cwa/en/USD/organization' },
        //     ...EXPECTED_MENU_ITEMS // Include all the dropdown items
        // ];

        await test.step('Navigate to homepage and open My Account dropdown', async () => {
            const myAccountButton = page.locator('cw-navigation-ui button[aria-label="My Account"]');
            await expect(myAccountButton).toBeVisible();
            await myAccountButton.click();
        });

        await test.step('Navigate to Account Overview', async () => {
            const accountOverviewLink = page.locator('cw-navigation-ui .childs cx-generic-link a[href="/cwa/en/USD/my-account/update-profile"]');
            await Promise.all([
                page.waitForURL('**/my-account/update-profile'),
                accountOverviewLink.click()
            ]);
        });

        await test.step('Verify My Account navigation bar is visible', async () => {
            const accountNavigation = page.locator('cw-account-navigation');
            await expect(accountNavigation).toBeVisible();
            
            const navigationTitle = page.locator('cw-account-navigation .title');
            await expect(navigationTitle).toHaveText('My Account');
        });

        await test.step('Verify all navigation links are present in the sidebar', async () => {
            const navLinkVerification = EXPECTED_MENU_ITEMS.map(async (navItem) => {
                const navLink = page.locator(`cw-account-navigation .childs cx-generic-link a[href="${navItem.href}"]`);
                await expect(navLink).toBeVisible();
                await expect(navLink).toHaveText(navItem.text);
                await expect(navLink).toHaveAttribute('href', navItem.href);
            });
            await Promise.all(navLinkVerification);
        });

        await test.step('Verify sidebar navigation items are in correct order', async() => {
            const navLinks = page.locator('cw-account-navigation .childs cx-generic-link a');
            await verifyNavigationOrder(navLinks, EXPECTED_MENU_ITEMS);
        });
    });
});