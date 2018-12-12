#!/usr/bin/env node

const fs = require("fs");
const { exec } = require("child_process");
const inquirer = require("inquirer");
const regex = /\b(ADJECTIVE|NOUN|VERB|ADVERB)\b/gm;

function prompt(question) {
	const prom = { type: "input", message: question, name: "answer" };
	return inquirer.prompt([prom]);
}

function findPrompts() {
	return new Promise((resolve, reject) => {
		fs.readFile("./sample.txt", "utf8", (e, data) => {
			if (e) {
				process.exit(1);
				reject(e);
			}
			const results = data.match(regex) || [];
			resolve(results);
		});
	});
}

function writeAnswer(answer, prom) {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync("./result.txt")) {
			fs.readFile("./sample.txt", "utf8", (e, data) => {
				if (e) {
					process.exit(1);
					reject(e);
				}
				const result = data.replace(prom, answer);
				fs.writeFile("./result.txt", result, err => {
					if (err) {
						process.exit(1);
						reject(err);
					}
					resolve();
				});
			});
		} else {
			fs.readFile("./result.txt", "utf8", (e, data) => {
				if (e) {
					process.exit(1);
					reject(e);
				}
				const res = data.replace(prom, answer);
				fs.writeFile("./result.txt", res, e => {
					if (e) {
						process.exit(1);
						reject(e);
					}
					resolve();
				});
			});
		}
	});
}

function getResult() {
	return new Promise((resolve, reject) => {
		fs.readFile("./result.txt", "utf8", (e, data) => {
			if (e) {
				process.exit(1);
				reject(e);
			}
			resolve(data);
		});
	});
}

async function main() {
	const prompts = await findPrompts();

	if (fs.existsSync("./result.txt")) {
		exec("rm -rf result.txt", (err, stdout, stderr) => {
			if (err || stderr) {
				process.exit(1);
				throw err || stderr;
			}
		});
	}

	while (prompts.length > 0) {
		const prom = prompts.shift();
		const nextPrompt = prom.toLowerCase();
		const question = `Enter ${prom === "ADJECTIVE" || prom === "ADVERB" ? "an" : "a"} ${nextPrompt}: `;
		const { answer } = await prompt(question);
		await writeAnswer(answer, prom);
	}
	const result = await getResult();
	console.log(result);
	process.exit(0);
}

main();
