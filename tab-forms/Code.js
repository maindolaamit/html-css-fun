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

//# Main Function
//function doGet(e) {
//  return HtmlService
//    .createHtmlOutputFromFile('Page').e
//    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
//}
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
    var sheet = SpreadsheetApp.openByUrl(invNamingLogicSheetURL).getSheetByName(invNamingLogicSheetName);
    // This represents ALL the data
    var range = sheet.getDataRange();
    var values = range.getValues();
    Logger.log(values);
    // Get the prefix for Invoice
    let prefix = "";
    for (var i = 0; i < values.length; i++) {
        if (values[i][0] == "SALES_INVNUM") {
            prefix = values[i][1]
            break;
        }
    }
    // Fetch the max non empty row
    var salesSheet = SpreadsheetApp.openByUrl(salesTrxSheetURL).getSheetByName(salesTrxSheetName);
    let lastRowNum = salesSheet.getLastRow();
    let newRowNum = padZeroToNumber(lastRowNum, invNumLength); // new Array(invNumLength - (lastRowNum.toString().length) + 1).join('0') + (lastRowNum+1);  
    let invNum = prefix + currentDate.getFullYear() + padZeroToNumber(currentDate.getMonth(), 2) + "-" + newRowNum;

    Logger.log(invNum);
    return invNum;
}

// Add 0 to the number
function padZeroToNumber() {
    let num = 1000;
    let desiredWidth = 3;
    Logger.log(num.toString().length);
    Logger.log(desiredWidth - (num.toString().length));
    let value = new Array(desiredWidth - (num.toString().length) + 1).join('0') + num;
    Logger.log(value)
    return value;
}