import { Locator, Page, expect } from '@playwright/test';

export class PartsSearchPage {
    readonly page: Page;
    readonly partsSearchForm: Locator;
    readonly modelNumberInput: Locator;
    readonly searchButton: Locator;
    readonly partsResults: Locator;
    readonly resultsTable: Locator;
    readonly successMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.partsSearchForm = page.locator('form').filter({ has: page.locator('[formcontrolname="modelNumber"]') });
        this.modelNumberInput = page.locator('[formcontrolname="modelNumber"]');
        this.searchButton = page.getByRole('button', { name: 'Search' });
        this.partsResults = page.locator('cw-parts-results');
        this.resultsTable = this.partsResults.locator('table');
        this.successMessage = page.locator('.alert.alert-success');
    }

    async goto() {
        await this.page.goto('/partsSearch');
        await this.expectPartsSearchPageLoaded();
    }

    async navigateViaLink() {
        await this.page.getByRole('link', { name: 'Parts' }).click();
        await this.expectPartsSearchPageLoaded();
    }

    async expectPartsSearchPageLoaded() {
        await expect(this.page).toHaveURL(/\/partsSearch/);
        await expect(this.modelNumberInput).toBeVisible({ timeout: 10000 });
    }

    async searchByModelNumber(modelNumber: string) {
        await this.modelNumberInput.click();
        await this.modelNumberInput.fill(modelNumber);
        await this.searchButton.click();
        await this.expectResultsTableLoaded();
    }

    async expectResultsTableLoaded() {
        await expect(this.partsResults).toBeVisible({ timeout: 10000 });
        await expect(this.resultsTable).toBeVisible({ timeout: 10000 });
    }

    async findPartRowByNumber(partNumber: string): Promise<Locator> {
        const row = this.resultsTable.locator('tr', {
            has: this.page.locator('td', { hasText: partNumber })
        });
        await expect(row).toBeVisible({ timeout: 10000 });
        return row;
    }

    async addPartToCart(partNumber: string) {
        const row = await this.findPartRowByNumber(partNumber);
        const addToCartButton = row.getByRole('button', { name: /add to cart/i });
        
        // Wait for button to be enabled
        await expect(addToCartButton).toBeEnabled({ timeout: 10000 });
        await addToCartButton.click();
    }

    async expectPartInResults(partNumber: string) {
        const row = await this.findPartRowByNumber(partNumber);
        await expect(row).toBeVisible();
    }

    async expectSuccessMessage(partNumber: string) {
        await expect(this.successMessage).toBeVisible({ timeout: 10000 });
        await expect(this.successMessage).toContainText(`Cart quantity for product ${partNumber} was updated successfully`);
    }
}
