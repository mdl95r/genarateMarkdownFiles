import * as fs from 'fs';
import mustache from "mustache"
import { customAlphabet } from 'nanoid';
import converter from 'json-2-csv';

const opts = {
	csvFile: 'clients',
	mdPath: 'markdown',
	outputFolder: 'excel',
	outputFile: 'result',
}

const template = `---
company: {{ company }}
name: {{ name }}
---`

let result = {
	table: []
};

if (!fs.existsSync(opts.mdPath)) fs.mkdirSync(opts.mdPath);

if (!fs.existsSync(opts.outputFolder)) fs.mkdirSync(opts.outputFolder);

fs.readFile(`${opts.csvFile}.csv`, 'utf-8', (err, data) => {
	if(err) {
		throw err;
    }
	const csv = data;
	csvToJson(csv);
});

const csvToJson = (data) => {
	converter.csv2json(data, function (err, array) {
		let jsonString;
		const arr = [];

		for (let i = 0; i < array.length; i++) {
			jsonString = JSON.stringify(array[i]);
			jsonString = JSON.parse(jsonString.replace(/\\r/g, ""));
			arr.push(jsonString);
		}

		parseArray(arr);
	})
}

const parseArray = clients => {
	clients.forEach(client => {

		const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10);
		const fileName = nanoid();
		const output = mustache.render(template, client);
	
		fs.writeFileSync(`${opts.mdPath}/${fileName}.md`, output);

		result.table.push(
			{
				number: client.number, 
				company: client.company,
				name: client.name,
				fileName: fileName
			}
		);

		converter.json2csv(result.table, function (err, csv) {
			fs.writeFileSync(`${opts.outputFolder}/${opts.outputFile}.csv`, csv)
		})

		fs.writeFileSync(`${opts.outputFolder}/${opts.outputFile}.json`, JSON.stringify(result, null, 4), (err) => {
			if (err) {
				console.error(err);
				return;
			}
			console.log(`File ${opts.outputFile}.json has been created`);
		});
	})
}
