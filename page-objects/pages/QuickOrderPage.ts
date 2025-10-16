import { Locator, Page, expect } from '@playwright/test';

export class QuickOrderPage {
    readonly page: Page;
    readonly quickOrderForm: Locator;
    readonly productInput: Locator;
    readonly suggestionList: Locator;
    readonly quickOrderTable: Locator;
    readonly quickOrderItems: Locator;
    readonly successMessage: Locator;
    readonly resetButton: Locator;
    readonly exportButton: Locator;
    readonly downloadTemplateButton: Locator;
    readonly emptyListButton: Locator;
    readonly importButton: Locator;
    readonly selectFileButton: Locator;
    readonly uploadButton: Locator;
    readonly maxProductsMessage: Locator;
    readonly importProductsDialog: Locator;
    readonly importSummary: Locator;
    readonly closeImportDialogButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.quickOrderForm = page.locator('cw-quick-order-form');
        this.productInput = page.getByRole('textbox', { name: /Enter Product name or SKU/i });
        this.suggestionList = page.locator('.product-suggestion-list ul.quick-order-results-products');
        this.quickOrderTable = page.locator('cw-quick-order-table');
        this.quickOrderItems = page.locator('tr[cw-quick-order-item]');
        this.successMessage = page.locator('.alert-info');
        this.resetButton = page.getByRole('button', { name: 'Reset' });
        this.exportButton = page.getByRole('button', { name: 'Export' }).first();
        this.downloadTemplateButton = page.getByRole('link', { name: 'Download Template' }).first();
        this.emptyListButton = page.getByRole('button', { name: 'Empty list' });
        this.importButton = page.getByRole('button', { name: 'Import Products' }).first();
        this.selectFileButton = page.getByRole('button', { name: 'Select file' });
        this.uploadButton = page.getByRole('button', { name: 'Upload' });
        this.maxProductsMessage = page.locator('text=/Only \\d+ valid Products\\/SKUs/i');
        this.importProductsDialog = page.locator('cw-import-entries-dialog');
        this.importSummary = page.locator('cw-import-entries-summary');
        this.closeImportDialogButton = this.importSummary.getByRole('button', { name: 'Close' });
    }

    async goto() {
        await this.page.goto('/my-account/quick-order');
        await this.quickOrderForm.waitFor({ state: 'visible', timeout: 10000 });
    }

    async navigateViaLink() {
        const quickOrderLink = this.page.getByRole('link', { name: /Quick order/i });
        await quickOrderLink.click();
        await this.quickOrderForm.waitFor({ state: 'visible', timeout: 10000 });
    }

    async searchAndSelectProduct(productCode: string) {
        await this.productInput.click();
        await this.productInput.fill(productCode);
        
        await this.suggestionList.waitFor({ state: 'visible', timeout: 5000 });
        
        const option = this.page.getByRole('option', { name: new RegExp(`ID ${productCode}`, 'i') });
        await expect(option).toBeVisible({ timeout: 5000 });
        await option.click();
        await this.suggestionList.waitFor({ state: 'hidden', timeout: 5000 });

        const productRow = this.page.locator('tr[cw-quick-order-item]', {
            has: this.page.locator('td .code-name-wrapper div', { hasText: productCode })
        });
        await productRow.waitFor({ state: 'visible', timeout: 10000 });
    }

    async verifyProductInTable(productCode: string): Promise<boolean> {
        const productRow = this.quickOrderItems.filter({
            has: this.page.locator('td .code-name-wrapper div', { hasText: productCode })
        });
        
        return await productRow.count() > 0;
    }

    async getProductCodeFromTable(index: number): Promise<string> {
        const productRow = this.quickOrderItems.nth(index);
        const codeElement = productRow.locator('td .code-name-wrapper div').first();
        const codeText = await codeElement.textContent();
        return codeText?.trim() || '';
    }

    async getAllProductCodesInTable(): Promise<string[]> {
        const items = await this.quickOrderItems.all();
        const codes: string[] = [];
        
        for (const item of items) {
            const codeElement = item.locator('td .code-name-wrapper div').first();
            const codeText = await codeElement.textContent();
            if (codeText) {
                codes.push(codeText.trim());
            }
        }
        
        return codes;
    }

    async getProductCount(): Promise<number> {
        return await this.quickOrderItems.count();
    }

    async clickReset() {
        await this.resetButton.click();
    }

    async clickEmptyList() {
        await this.emptyListButton.click();
    }

    async exportProducts(): Promise<void> {
        const downloadPromise = this.page.waitForEvent('download');
        await this.exportButton.click();
        await downloadPromise;
    }

    async downloadTemplate(): Promise<void> {
        await expect(this.downloadTemplateButton).toBeVisible();
        
        // Remove target="_blank" to download in same context instead of new tab
        await this.downloadTemplateButton.evaluate((el: HTMLAnchorElement) => {
            el.removeAttribute('target');
        });
        
        const downloadPromise = this.page.waitForEvent('download');
        await this.downloadTemplateButton.click();
        const download = await downloadPromise;
        
        console.log('Template downloaded:', await download.suggestedFilename());
    }


    async importProductsFromFile(filePath: string) {
        await this.importButton.click();
        await expect(this.importProductsDialog).toBeVisible({ timeout: 5000 });
        
        const fileChooserPromise = this.page.waitForEvent('filechooser');
        await this.selectFileButton.click();
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(filePath);
        
        await this.uploadButton.click();
        
        await expect(this.importSummary).toBeVisible({ timeout: 10000 });
        
        //Verify upload finished message
        await expect(this.importSummary).toContainText('Upload finished');
        await this.closeImportDialogButton.click();
        await expect(this.importProductsDialog).toBeHidden({ timeout: 5000 });
    }

    async expectQuickOrderPageLoaded() {
        await expect(this.quickOrderForm).toBeVisible({ timeout: 10000 });
        await expect(this.productInput).toBeVisible();
    }

    async expectProductInTable(productCode: string) {
        const productRow = this.quickOrderItems.filter({
            has: this.page.locator('td .code-name-wrapper div', { hasText: productCode })
        });
        await expect(productRow).toBeVisible({ timeout: 5000 });
    }

    async expectMaxProductsMessage() {
        await expect(this.maxProductsMessage).toBeVisible({ timeout: 5000 });
    }

    async expectSuccessMessage(message: string) {
        const specificMessage = this.page.locator('.alert-info', { hasText: message });
        await expect(specificMessage).toBeVisible({ timeout: 10000 });
    }

    async expectTableEmpty() {
        await expect(this.quickOrderItems).toHaveCount(0);
    }

    async expectProductsLoadedFromFile(expectedProductCodes: string[]) {
        await this.page.waitForTimeout(2000);
        const actualCount = await this.getProductCount();
        expect(actualCount).toBe(expectedProductCodes.length);
        
        // Verify each product code is in the table
        const allCodesInTable = await this.getAllProductCodesInTable();
        console.log('Products loaded from file:', allCodesInTable);
        
        for (const productCode of expectedProductCodes) {
            const isInTable = await this.verifyProductInTable(productCode);
            expect(isInTable).toBeTruthy();
        }
    }

    async expectImportSummary(expectedSuccessCount: number, totalCount: number) {
        await expect(this.importSummary).toBeVisible({ timeout: 10000 });
        await expect(this.importSummary).toContainText('Upload finished');
        await expect(this.importSummary).toContainText(
            `${expectedSuccessCount} out of ${totalCount} products have been imported successfully`
        );
    }
}
