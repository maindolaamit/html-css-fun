const salesTrxSheetURL = "https://docs.google.com/spreadsheets/d/1P_3QPMPP6FxSQAGKyG-F5ISzjO_wU_N1_6I6liD7WyA/edit#gid=0";
const prodSheetURL = "https://docs.google.com/spreadsheets/d/1ZalRNhHoPHJ5Oja8oRs44E_0th5BBqszR8ffazVbUCM/edit#gid=0";
const purchaseTrxSheetURL = "https://docs.google.com/spreadsheets/d/17igkqIv1TEYPBhFbBlzg3zJA8ZOZHwWFY77HtdCW7Ys/edit#gid=651579054";
const indianStatesSheetURL = "https://docs.google.com/spreadsheets/d/1lS9EmtJw2DgZiMFP2uIZNAiV6RTeMeD8dfirPqa6b6c/edit#gid=1159988409";
const custSheetURL = "https://docs.google.com/spreadsheets/d/1lS9EmtJw2DgZiMFP2uIZNAiV6RTeMeD8dfirPqa6b6c/edit#gid=355286697";
const suppSheetURL = "https://docs.google.com/spreadsheets/d/1lS9EmtJw2DgZiMFP2uIZNAiV6RTeMeD8dfirPqa6b6c/edit#gid=0";

const salesTrxSheetName = "Sales";
const prodSheetName = "Product";
const purchaseTrxSheetName = "Purchase";
const custSheetName = "Customer";
const suppSheetName = "Supplier";
const indianStateSheetName = "States";

const currentDate = new Date();
const invNumLength = 5;


//# Main Function
function doGet(request) {
    Logger.log("Main function");
    let template = HtmlService.createTemplateFromFile('MainPage');
    return template.evaluate();
}

//# Function to include CSS file
function include(filename) {
    Logger.log("Including file : " + filename);
    //let template = HtmlService.createHtmlOutputFromFile(filename);
    let template = HtmlService.createTemplateFromFile(filename);
    if (filename === "CustomerPage" || filename === "SupplierPage") {
        template.statesOptionHtml = getStatesOptionHTML();
        // Logger.log(template.statesOptionHtml);
    }

    // Add Product Information
    if (filename === "PurchasePage" || filename === "SalesPage") {
        template.prodOptionHtml = getProductsOptionHTML();
        // Logger.log(template.prodOptionHtml);
    }

    // Add Supplier Information
    if (filename === "PurchasePage" || filename === "SalesPage") {
        template.supplierInfoList = getSupplierInfoList();
        Logger.log(template.supplierInfoList);
    }
    return template.evaluate().getContent();
}

function getStatesOptionHTML() {
    let ss = SpreadsheetApp.openByUrl(indianStatesSheetURL);
    let ws = ss.getSheetByName(indianStateSheetName);
    let statesList = ws.getRange(2, 1, ws.getLastRow() - 1, 2).getValues();
    // Logger.log(statesList);

    return statesList.map(function (r) {
        if (r[1] === "UK") {
            return `<option selected value="${r[1]}">${r[0]}</option>`;
        }
        return `<option value="${r[1]}">${r[0]}</option>`;
    }).join("");
}

function getProductsOptionHTML() {
    let ss = SpreadsheetApp.openByUrl(prodSheetURL);
    let ws = ss.getSheetByName(prodSheetName);
    let productNumList = ws.getRange(2, 2, ws.getLastRow() - 1, 1).getValues();
    return productNumList.map(function (r) {
        return `<option value="${r[0]}">${r[0]}</option>`;
    }).join("");
}

function getSupplierInfoList() {
    let ss = SpreadsheetApp.openByUrl(suppSheetURL);
    let ws = ss.getSheetByName(suppSheetName);
    let supplierList = {}
    supplierList.ids = ws.getRange(2, 1, ws.getLastRow() - 1, 1).getValues();
    supplierList.phone = ws.getRange(2, 4, ws.getLastRow() - 1, 1).getValues();
    return supplierList;
}

// ###############################################################################################################################################
// Pad zero to the input number making it upto desiredWidth
function padZeroToNumber(num, desiredWidth) {
    if (num.toString().length >= desiredWidth) {
        return num;
    } else {
        return new Array(desiredWidth - (num.toString().length) + 1).join('0') + num;
    }
}

// Return the Rownum of Search value in Column datarange
function searchValueRownum(ss, srchCol, srchValue) {
    const lastRow = ss.getLastRow();
    const range = srchCol.concat("1:", srchCol, lastRow);
    let srchData = ss.getRange(range).getValues();
    for (let i = 0; i < srchData.length; i++) {
        // Logger.log(srchData[i].toString() + " : " + srchData[i].toString().length);
        if (srchData[i].toString() === srchValue) {
            Logger.log("Found at " + (i + 1));
            return i + 1; // Add 1 as index start at 0
        }
    }
    return null;
}

// ###############################################################################################################################################

// Search Customer
function searchCustomer(searchParams) {
    Logger.log(searchParams);
    const ss = SpreadsheetApp.openByUrl(custSheetURL).getSheetByName(custSheetName);
    let lastRow = ss.getLastRow();
    let lastColumn = ss.getLastColumn();
    let srchCol = "", srchValue = "";
    let searchResult = {};

    // Check if customer id is given
    if (searchParams.id) {
        srchCol = "A";
        srchValue = searchParams.id
    } else if (searchParams.phone) {
        srchCol = "D";
        srchValue = searchParams.phone;
    } else if (searchParams.email) {
        srchCol = "F";
        srchValue = searchParams.email;
    }
    // Loop and search for the details
    try {
        let existingRownum = searchValueRownum(ss, srchCol, srchValue);
        Logger.info("Rownum : " + existingRownum);
        if (existingRownum) {
            let data = ss.getRange(existingRownum, 1, 1, lastColumn).getDisplayValues()[0];
            searchResult = {status: "SUCCESS", data: data};
        } else {
            searchResult = {status: "NOT_FOUND", data: null};
        }
    } catch (e) {
        searchResult = {status: "ERROR", message: e.message};
    }
    Logger.info(searchResult);
    return searchResult;
}

// Save the customer information
function saveCustomer(formData) {
    const ss = SpreadsheetApp.openByUrl(custSheetURL).getSheetByName(custSheetName);
    const lastRow = ss.getLastRow();
    let saveResult = {};
    // Check if id is present for update
    if (formData.id) {
        let existingRownum = searchValueRownum(ss, "A", formData.id);
        // Check if customer already exists
        if (existingRownum) {
            // Customer already exists
            Logger.log(formData.id + "- Updating rownum " + existingRownum);
            ss.getRange('B' + existingRownum).setValue(formData.firstName);
            ss.getRange('C' + existingRownum).setValue(formData.lastName);
            ss.getRange('D' + existingRownum).setValue(formData.primaryCell);
            ss.getRange('E' + existingRownum).setValue(formData.secondaryCell);
            ss.getRange('F' + existingRownum).setValue(formData.primaryEmail);
            ss.getRange('G' + existingRownum).setValue(formData.secondaryEmail);
            ss.getRange('H' + existingRownum).setValue(formData.street);
            ss.getRange('I' + existingRownum).setValue(formData.area);
            ss.getRange('J' + existingRownum).setValue(formData.city);
            ss.getRange('K' + existingRownum).setValue(formData.state);
            ss.getRange('L' + existingRownum).setValue(formData.country);
            ss.getRange('M' + existingRownum).setValue(formData.type);
            ss.getRange('N' + existingRownum).setValue(formData.trxDate);
            saveResult = {status: "SUCCESS", id: formData.id, message: "Customer Information updated successfully."}
        } else {
            saveResult = {status: "FAIL", message: "CustomerId not found : " + formData.id}
        }
    } else {
        Logger.log("Inserting new row...");
        let id = "C" + currentDate.getFullYear() + padZeroToNumber(lastRow + 1, 6);
        ss.appendRow([id, formData.firstName, formData.lastName, formData.primaryCell, formData.secondaryCell, formData.primaryEmail
            , formData.secondaryEmail, formData.street, formData.area, formData.city, formData.state, formData.country
            ,formData.type, formData.trxDate]);
        saveResult = {status: "SUCCESS", id: id, message: "Customer created successfully."}
    }
    Logger.log(saveResult.message);
    return saveResult;
}

// Search Supplier
function searchSupplier(searchParams) {
    Logger.log(searchParams);
    const ss = SpreadsheetApp.openByUrl(suppSheetURL).getSheetByName(suppSheetName);
    let lastRow = ss.getLastRow();
    let lastColumn = ss.getLastColumn();
    let srchCol = "", srchValue = "";
    let searchResult = {};

    // Check if customer id is given
    if (searchParams.id) {
        srchCol = "A";
        srchValue = searchParams.id
    } else if (searchParams.phone) {
        srchCol = "D";
        srchValue = searchParams.phone;
    } else if (searchParams.email) {
        srchCol = "F";
        srchValue = searchParams.email;
    } else if (searchParams.bankAccount) {
        srchCol = "H";
        srchValue = searchParams.bankAccount;
    }

    // Loop and search for the details
    try {
        let existingRownum = searchValueRownum(ss, srchCol, srchValue);
        console.log("Rownum : " + existingRownum);
        if (existingRownum) {
            let data = ss.getRange(existingRownum, 1, 1, lastColumn).getDisplayValues()[0];
            searchResult = {status: "SUCCESS", data: data};
        } else {
            searchResult = {status: "NOT_FOUND", data: null};
        }
    } catch (e) {
        searchResult = {status: "ERROR", message: e.message};
    }
    Logger.info(searchResult);
    return searchResult;
}

function saveSupplier(formData) {
    let ss = SpreadsheetApp.openByUrl(suppSheetURL).getSheetByName(suppSheetName);
    let saveResult = {};
    // Check if Supplier is existing, update if exists
    if (formData.id) {
        // Search the supplier id rownum
        let existingRownum = searchValueRownum(ss, "A", formData.id);
        if (existingRownum) {
            // Supplier already exists
            Logger.log(formData.id + "- Updating rownum " + existingRownum);
            ss.getRange('B' + existingRownum).setValue(formData.firstName);
            ss.getRange('C' + existingRownum).setValue(formData.lastName);
            ss.getRange('D' + existingRownum).setValue(formData.primaryCell);
            ss.getRange('E' + existingRownum).setValue(formData.secondaryCell);
            ss.getRange('F' + existingRownum).setValue(formData.primaryEmail);
            ss.getRange('G' + existingRownum).setValue(formData.secondaryEmail);
            ss.getRange('H' + existingRownum).setValue(formData.bankName);
            ss.getRange('I' + existingRownum).setValue(formData.bankBranch);
            ss.getRange('J' + existingRownum).setValue(formData.bankAccount);
            ss.getRange('K' + existingRownum).setValue(formData.bankIfsc);
            ss.getRange('L' + existingRownum).setValue(formData.street);
            ss.getRange('M' + existingRownum).setValue(formData.area);
            ss.getRange('N' + existingRownum).setValue(formData.city);
            ss.getRange('O' + existingRownum).setValue(formData.state);
            ss.getRange('P' + existingRownum).setValue(formData.country);
            ss.getRange('Q' + existingRownum).setValue(formData.gstNumber);
            ss.getRange('R' + existingRownum).setValue(formData.trxDate);
            ss.getRange('S' + existingRownum).setValue(formData.status);
            saveResult = {status: "SUCCESS", id: formData.id, message: "Supplier Information updated successfully."};
        } else {
            // let id = "S" + currentDate.getFullYear() + padZeroToNumber(ss.getLastRow(), 6);
            ss.appendRow([formData.id, formData.firstName, formData.lastName, formData.primaryCell, formData.secondaryCell, formData.primaryEmail
                , formData.secondaryEmail,formData.bankName, formData.bankBranch, formData.bankAccount, formData.bankIfsc
                , formData.street, formData.area, formData.city, formData.state, formData.country, formData.gstNumber
                , formData.trxDate, formData.status]);
            saveResult = {status: "SUCCESS", id: id, message: "Supplier created successfully."}
        }
    }
    Logger.log(saveResult.message);
    return saveResult;
}

// get Product numbers list
function getProductNumbers() {
    let ss = SpreadsheetApp.openByUrl(prodSheetURL);
    let ws = ss.getSheetByName(prodSheetName);
    let dataRange = ws.getRange(2, 2, ws.getLastRow() - 1, 1).getValues();
    let data = {};

    dataRange.forEach(function (r) {
        data[r[0]] = null;
    });

    console.log(data);
    return data;
}

// Search Purchase Invoice
function searchPurchaseTrx(searchParams) {
    Logger.log(searchParams);
    const ss = SpreadsheetApp.openByUrl(purchaseTrxSheetURL).getSheetByName(purchaseTrxSheetName);
    let lastRow = ss.getLastRow();
    let lastColumn = ss.getLastColumn();
    let srchCol = "A";
    let srchValue = searchParams.invoice
    let searchResult = {};

    // Search for the details
    try {
        let existingRownum = searchValueRownum(ss, srchCol, srchValue);
        Logger.info("Rownum : " + existingRownum);
        if (existingRownum) {
            let data = ss.getRange(existingRownum, 1, 1, lastColumn).getDisplayValues()[0];
            searchResult = {status: "SUCCESS", data: data};
        } else {
            searchResult = {status: "NOT_FOUND", data: null};
        }
    } catch (e) {
        searchResult = {status: "ERROR", message: e.message};
    }
    Logger.info(searchResult);
    return searchResult;
}

function savePurchaseTrx(formData) {
    const ss = SpreadsheetApp.openByUrl(purchaseTrxSheetURL).getSheetByName(purchaseTrxSheetName);
    const lastRow = ss.getLastRow();
    let saveResult = {};
    // Check if id is present for update
    let existingRownum = searchValueRownum(ss, "A", formData.id);
    // Check if record already exists
    if (existingRownum) {
        // Customer already exists
        Logger.log(formData.invoiceNum + "- Updating rownum " + existingRownum);
        ss.getRange('B' + existingRownum).setValue(formData.trxDate);
        ss.getRange('C' + existingRownum).setValue(formData.supplierId);
        ss.getRange('D' + existingRownum).setValue(formData.challan);
        // ss.getRange('E' + existingRownum).setValue(formData.secondaryCell);
        // ss.getRange('F' + existingRownum).setValue(formData.primaryEmail);
        // ss.getRange('G' + existingRownum).setValue(formData.secondaryEmail);
        // ss.getRange('H' + existingRownum).setValue(formData.street);
        // ss.getRange('I' + existingRownum).setValue(formData.area);
        // ss.getRange('J' + existingRownum).setValue(formData.city);
        // ss.getRange('K' + existingRownum).setValue(formData.state);
        // ss.getRange('L' + existingRownum).setValue(formData.country);
        // ss.getRange('M' + existingRownum).setValue(formData.trxDate);
        saveResult = {
            status: "SUCCESS",
            id: formData.invoiceNum,
            message: "Invoice Information updated successfully."
        }
    } else {
        saveResult = {status: "FAIL", message: "Invoice not found : " + formData.invoiceNum}
        Logger.log("Inserting new row...");
        ss.appendRow([formData.invoiceNum, formData.trxDate, formData.supplierId, formData.challan]);
        saveResult = {status: "SUCCESS", invoiceNum: formData.invoiceNum, message: "Invoice created successfully."}
    }
    Logger.log(saveResult.message);
    return saveResult;
}

//# Function to Save sales Transaction
function saveSalesTrx(formData) {
    Logger.log("Creating Invoice for " + formData.custEmail);
    var ss = SpreadsheetApp.openByUrl(salesTrxSheetURL).getSheetByName(salesTrxSheetName);

    var newInvNum = "INV001";
    var totalPrice = formData.unitPrice * formData.qty
    Logger.log(ss.getLastRow());
    ss.appendRow([newInvNum, formData.trxDate, formData.productCode, "", formData.custName, formData.custMobile, formData.unitPrice, formData.qty, formData.totalPrice]);
}

// Function to get new Sales Invoice Number
function getSalesInvNum() {
    Logger.log("Autogenerating sales invoice number");
    // Get the prefix for Invoice
    let prefix = "CEK/" + currentDate.getFullYear();
    // Fetch the max non empty row
    let salesSheet = SpreadsheetApp.openByUrl(salesTrxSheetURL).getSheetByName(salesTrxSheetName);
    let lastRowNum = salesSheet.getLastRow();
    let newRowNum = padZeroToNumber(lastRowNum + 1, invNumLength); // new Array(invNumLength - (lastRowNum.toString().length) + 1).join('0') + (lastRowNum+1);
    let invNum = prefix + "/" + newRowNum;

    Logger.log(invNum);
    return invNum;
}
