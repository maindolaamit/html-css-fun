//# Main Function
function doGet(request) {
    Logger.log("Main function");
    var template = HtmlService.createTemplateFromFile('MainPage');
    //  Logger.log(template.getCode());
    return template.evaluate();
}

//# Function to include CSS file
function include(filename) {
    Logger.log("Including file : " + filename);
    var output = HtmlService.createHtmlOutputFromFile(filename);
    return output.getContent();
}

// ###############################################################################################################################################
var salesTrxSheetURL = "https://docs.google.com/spreadsheets/d/1P_3QPMPP6FxSQAGKyG-F5ISzjO_wU_N1_6I6liD7WyA/edit#gid=0";
var purchaseTrxSheetURL = "https://docs.google.com/spreadsheets/d/17igkqIv1TEYPBhFbBlzg3zJA8ZOZHwWFY77HtdCW7Ys/edit#gid=651579054";
var custSetupSheetURL = "https://docs.google.com/spreadsheets/d/1SuXkpfhFDJzCdj55t9xvtzkpPHKQmc1DROyiTgzv8rE/edit#gid=0";
var prodSetupSheetURL = "https://docs.google.com/spreadsheets/d/1ZalRNhHoPHJ5Oja8oRs44E_0th5BBqszR8ffazVbUCM/edit#gid=0";
var invNamingLogicSheetURL = "https://docs.google.com/spreadsheets/d/1P_3QPMPP6FxSQAGKyG-F5ISzjO_wU_N1_6I6liD7WyA/edit#gid=362233469";

var salesTrxSheetName = "Sales";
var purchaseTrxSheetName = "Purchase";
var custSetupSheetName = "Customer";
var prodSetupSheetName = "Product";
var invNamingLogicSheetName = "INV_NAMING_CONVENTION";

var currentDate = new Date();
var invNumLength = 5;

// Search Customer
function searchCustomer(custSearchInfo) {
    Logger.log(custSearchInfo);
    const ss = SpreadsheetApp.openByUrl(custSetupSheetURL).getSheetByName(custSetupSheetName);
    var lastRow = ss.getLastRow();
    var lastColumn = ss.getLastColumn();
    let srchCol = "", srchValue = "";

    // Check if customer id is given
    if (custSearchInfo.id) {
        srchCol = 1;
        srchValue = custSearchInfo.id
    }
    else if (custSearchInfo.phone) {
        srchCol = 4;
        srchValue = custSearchInfo.phone;
    }
    else if (custSearchInfo.email) {
        srchCol = 6;
        srchValue = custSearchInfo.email;
    }
    // Loop and search for the details
    var srchData = ss.getRange(2, srchCol, lastRow-1).getValues();
    for (var i = 0; i < srchData.length; i++) {
        Logger.log(srchData[i].toString());
        if (srchData[i].toString() === srchValue) {
            let data = ss.getRange(i+2, 1, 1, lastColumn).getValues()[0]
            return {status:"SUCCESS", custData:data};         
        }
    }
    return {status:"NOT_FOUND", data:null};
}

function saveCustomer(customerInfo) {
    Logger.log(customerInfo);
}

// Search Supplier
function searchSupplier(suppSearchInfo) {
    Logger.log(suppSearchInfo);
    const ss = SpreadsheetApp.openByUrl(custSetupSheetURL).getSheetByName(custSetupSheetName);
    var lastRow = ss.getLastRow();
    var lastColumn = ss.getLastColumn();
    let srchCol = "", srchValue = "";

    // Check if customer id is given
    if (suppSearchInfo.id) {
        srchCol = 1;
        srchValue = suppSearchInfo.id
    }
    else if (suppSearchInfo.phone) {
        srchCol = 4;
        srchValue = suppSearchInfo.phone;
    }
    else if (suppSearchInfo.email) {
        srchCol = 6;
        srchValue = suppSearchInfo.email;
    }
    else if (suppSearchInfo.bankAccount) {
        srchCol = 8;
        srchValue = suppSearchInfo.bankAccount;
    }
    // Loop and search for the details
    var srchData = ss.getRange(2, srchCol, lastRow-1).getValues();
    for (var i = 0; i < srchData.length; i++) {
        Logger.log(srchData[i].toString());
        if (srchData[i].toString() === srchValue) {
            let data = ss.getRange(i+2, 1, 1, lastColumn).getValues()[0]
            return {status:"SUCCESS", suppData:data};         
        }
    }
    return {status:"NOT_FOUND", data:null};
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
    var salesSheet = SpreadsheetApp.openByUrl(salesTrxSheetURL).getSheetByName(salesTrxSheetName);
    let lastRowNum = salesSheet.getLastRow();
    let newRowNum = padZeroToNumber(lastRowNum + 1, invNumLength); // new Array(invNumLength - (lastRowNum.toString().length) + 1).join('0') + (lastRowNum+1);  
    let invNum = prefix + "/" + newRowNum;

    Logger.log(invNum);
    return invNum;
}

// Pad zero to the input number making it upto desiredWidth
function padZeroToNumber(num, desiredWidth) {
    if (num.toString().length >= desiredWidth) {
        return num;
    } else {
        let value = new Array(desiredWidth - (num.toString().length) + 1).join('0') + num;
        return value;
    }
}