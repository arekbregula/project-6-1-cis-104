// Description: Project 6 for CIS 104
// Author: Arkadiusz Bregula (bregulaa@student.ncmich.edu)
// Version: 1.0.0

'use strict';

const PROMPT = require('readline-sync');
const fs = require('fs');
const path = require('path');

const DATA_DIRECTORY = "./data/";
const MASTER_FILE = path.join(__dirname, DATA_DIRECTORY, 'master.csv');

let masterList = [];
let transactionList = [];
let errorTransactions = [];

/**
 * The main dispatcher function for the program.
 */
function main() {
	setMasterList();
	setTransactionList();
	processTransactionList();

	writeMasterList();

	outputCoupons();

	outputErrorTransactions();
}

/**
 * Reads the master file and sets the masterList variable.
 */
function setMasterList() {
	var csvData = readCsv(MASTER_FILE);
	for(let i = 0; i < csvData.length; i++) {
		var client = {
			'id': csvData[i][0],
			'firstName': csvData[i][1],
			'lastName': csvData[i][2],
			'spentYearly': Number(csvData[i][3]),
			'spentWeekly': 0
		};
		masterList.push(client);
	}
}

/**
 * Writes the masterList variable to the master file.
 */
function writeMasterList() {
	var masterCsvData = [];
	for(let i = 0; i < masterList.length; i++) {
		masterCsvData.push([masterList[i].id, masterList[i].firstName, masterList[i].lastName, String(masterList[i].spentYearly.toFixed(2))]);
	}
	writeCsv(MASTER_FILE, masterCsvData);
}

/**
 * Reads a csv file located at filepath and returns an array of the rows and columns.
 * @param  {String} filepath The path to the csv file.
 * @return {Array}           The csv file stored as a two dimensional array.
 */
function readCsv(filepath) {
	let fileContent = fs.readFileSync(filepath, 'utf-8');
	let lines = fileContent.split('\n');
	let colCount = 0;

	let csvData = [];

	for(let i = 0; i < lines.length; i++) {
		let line = lines[i].trim();

		if(line == '') { continue; }

		let columns = line.split(',');

		if(colCount == 0) { colCount = columns.length; }

		if(columns.length == colCount) {
			csvData.push(columns);
		}
	}

	return csvData;
}

/**
 * Writes a two dimensional array to a csv file located at filepath.
 * @param  {String} filepath Path for the csv file to be written.
 * @param  {Array}  data     Two dimensional array which is to be written as a csv file.
 */
function writeCsv(filepath, data) {
	let colCount = data[0].length;
	let csvString = '';

	for(let i = 0; i < data.length; i++) {
		for(let x = 0; x < colCount; x++) {
			csvString += `${data[i][x]}`;
			if(x < colCount-1) {
				csvString += ',';
			}
		}
		csvString += '\n';
	}
	fs.writeFileSync(filepath, csvString);
}

/**
 * Finds and reads all the transaction files in the program's data directory and sets the transactionList variable.
 */
function setTransactionList() {
	let files = fs.readdirSync('./data/');
	for(let i = 0; i < files.length; i++) {
		if(files[i].startsWith('trans_')) {
			let filename = files[i].split('_');
			let weekNumber = filename[1].replace('.csv', '');

			let transactionData = readCsv(`./data/${files[i]}`);

			for(let i = 0; i < transactionData.length; i++) {
				let customerId = transactionData[i][0];
				let service = transactionData[i][1];
				let price = transactionData[i][2];

				transactionList.push({
					customerId,
					weekNumber,
					service,
					price: Number(price)
				});
			}
		}
	}
}

/**
 * Checks whether each transaction is valid and if it is adds the price to the customer's yearly spending.
 */
function processTransactionList() {
	for(let i = 0; i < transactionList.length; i++) {
		let customer = masterList.find(customer => customer.id == transactionList[i].customerId);
		if(customer != undefined) {
			masterList[masterList.indexOf(customer)].spentYearly += transactionList[i].price;
			masterList[masterList.indexOf(customer)].spentWeekly += transactionList[i].price;
		} else {
			errorTransactions.push(transactionList[i]);
		}
	}
}

/**
 * Checks how much each customer has spent this week, if it's more than $750, outuputs a coupon.
 */
function outputCoupons() {
	for(let i = 0; i < masterList.length; i++) {
		let customer = masterList[i];
		if(customer.spentWeekly > 750) {
			console.log('---------------------------------------------------');
			console.log(`Congratulations, ${customer.firstName} ${customer.lastName}!`);
			console.log('You have spent more than $750 this week.');
			console.log('This coupon allows you to receive one free haircut.');
			console.log('---------------------------------------------------\n');
		}
	}
}

/**
 * Outputs every transaction which doesn't have a valid customer in the master file.
 */
function outputErrorTransactions() {
	console.log('Transactions with no customer data in the master file:');

	for(let i = 0; i < errorTransactions.length; i++) {
		console.log('---------------------------------------------------');
		console.log(`\tCustomer ID: ${errorTransactions[i].customerId}`);
		console.log(`\tWeek Number: ${errorTransactions[i].weekNumber}`);
		console.log(`\tService: ${errorTransactions[i].service}`);
		console.log(`\tPrice: ${errorTransactions[i].price.toFixed(2)}`);
	}

}

main();