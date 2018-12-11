const fs = require("fs");
const { exec } = require("child_process");
const regex = /\b(ADJECTIVE|NOUN|VERB|ADVERB)\b/gm;

function prompt(question) {
	return new Promise((resolve, reject) => {
		const { stdin, stdout } = process;
		stdin.resume();
		stdout.write(question);

		stdin.on("data", data => resolve(data.toString().trim()));
		stdin.on("error", err => reject(err));
	});
}

function findPrompts() {
	return new Promise((resolve, reject) => {
		fs.readFile("./sample.txt", "utf8", (e, data) => {
			if (e) {
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
					reject(e);
				}
				const result = data.replace(prom, answer);
				fs.writeFile("./result.txt", result, err => {
					if (err) {
						reject(err);
					}
					resolve();
				});
			});
		} else {
			fs.readFile("./result.txt", "utf8", (e, data) => {
				if (e) {
					reject(e);
				}
				const res = data.replace(prom, answer);
				fs.writeFile("./result.txt", res, e => {
					if (e) {
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
				throw err || stderr;
			}
		});
	}

	while (prompts.length > 0) {
		const prom = prompts.shift();
		const nextPrompt = prom.toLowerCase();
		const question = `Enter ${prom === "ADJECTIVE" || prom === "ADVERB" ? "an" : "a"} ${nextPrompt}: `;
		const answer = await prompt(question);
		await writeAnswer(answer, prom);
	}
	const result = await getResult();
	console.log(result);
	process.exit();
}

main();
