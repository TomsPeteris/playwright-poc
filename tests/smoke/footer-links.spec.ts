import { BrowserContext, Locator, Page } from '@playwright/test';
import { expect, test } from '../../fixtures/custom-fixtures';
import { testUsers } from '../../fixtures/test-data';
import { LoginPage } from '../../page-objects/pages/LoginPage';

test.describe('Footer Links - Smoke Test', () => {

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
    
    test.use({
        page: async ({}, use) => {
            await use(sharedPage);
        }
    });

    // Expected footer links data - Resources section
    const EXPECTED_RESOURCES_LINKS = [
        { text: 'Brand Assets', href: 'https://qa.coa-retailers.com/brand-assets'},
        { text: 'Catalogs', href: 'https://www.coa-retailers.com/product-catalogs'},
        { text: 'Policies', href: 'https://www.coa-retailers.com/policies'},
        { text: 'Corporate Sales', href: 'https://www.cwacorporatesales.com/'},
        { text: 'Setting Instructions / Manuals & Watch Care', href: 'https://www.coa-retailers.com/setting-instructions-manuals-watch-care'},
        { text: 'About Citizen Watch Group', href: 'https://www.coa-retailers.com/about'},
        { text: 'CWA Institute', href: 'https://cwa-institute.litmos.com/cA'},
        { text: 'Email Signup', href: 'https://www.coa-retailers.com'},
    ];

    // Expected footer links data - Support section
    const EXPECTED_SUPPORT_LINKS = [
        { text: 'B2B Help', href: 'https://support.citizenwatchgroup.com/hc/en-us'},
        { text: 'Contact Us', href: 'https://www.coa-retailers.com/contact-us/'},
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
        
        expect(actualTexts).toEqual(expectedTexts);
        
        expect(actualHrefs).toEqual(expectedHrefs);
    }

    test('should display footer with Resources and Support sections with all required links', async ({ page, homePage }) => {
        await homePage.goto();
        
        const footer = page.locator('footer');

        await test.step('Verify footer is visible', async() => {
            await expect(footer).toBeVisible();
        });

        await test.step('Verify Resources section title and links', async() => {
            const resourcesSection = footer.locator('.links-wrapper:has(.title-font:text("Resources"))');
            await expect(resourcesSection).toBeVisible();
            
            const resourcesTitle = resourcesSection.locator('.title-font');
            await expect(resourcesTitle).toHaveText('Resources');
            
            const linkVerification = EXPECTED_RESOURCES_LINKS.map(async (linkItem) => {
                const link = resourcesSection.locator(`cx-generic-link a[href="${linkItem.href}"]`);  
                await expect(link).toBeVisible();
                await expect(link).toHaveText(linkItem.text);
                await expect(link).toHaveAttribute('href', linkItem.href);
            });
            await Promise.all(linkVerification);
        });

        await test.step('Verify Resources links are in correct order', async() => {
            const resourcesSection = footer.locator('.links-wrapper:has(.title-font:text("Resources"))');
            const resourceLinks = resourcesSection.locator('.childs cx-generic-link a');
            await verifyNavigationOrder(resourceLinks, EXPECTED_RESOURCES_LINKS);
        });

        await test.step('Verify Support section title and links', async() => {
            const supportSection = footer.locator('.links-wrapper:has(.title-font:text("Support"))');
            await expect(supportSection).toBeVisible();
            
            const supportTitle = supportSection.locator('.title-font');
            await expect(supportTitle).toHaveText('Support');
            
            // Verify all Support links are present
            const linkVerification = EXPECTED_SUPPORT_LINKS.map(async (linkItem) => {
                const link = supportSection.locator(`cx-generic-link a[href="${linkItem.href}"]`);  
                await expect(link).toBeVisible();
                await expect(link).toHaveText(linkItem.text);
                await expect(link).toHaveAttribute('href', linkItem.href);
            });
            await Promise.all(linkVerification);
        });

        await test.step('Verify Support links are in correct order', async() => {
            const supportSection = footer.locator('.links-wrapper:has(.title-font:text("Support"))');
            const supportLinks = supportSection.locator('.childs cx-generic-link a');
            await verifyNavigationOrder(supportLinks, EXPECTED_SUPPORT_LINKS);
        });
    });

    test('should verify footer links open in a new tab', async ({ page, homePage }) => {
        await homePage.goto();
        
        const footer = page.locator('footer');

        await test.step('Verify Resources links open in a new tab', async () => {
            const resourcesSection = footer.locator('.links-wrapper:has(.title-font:text("Resources"))');
            const resourceLinks = resourcesSection.locator('.childs cx-generic-link a');
            const links = await resourceLinks.all();
            
            for (const link of links) {
                await expect(link).toHaveAttribute('target', '_blank');
            }
        });

        await test.step('Verify Support links open in a new tab', async () => {
            const supportSection = footer.locator('.links-wrapper:has(.title-font:text("Support"))');
            const supportLinks = supportSection.locator('.childs cx-generic-link a');
            const links = await supportLinks.all();
            
            for (const link of links) {
                await expect(link).toHaveAttribute('target', '_blank');
            }
        });
    });
});