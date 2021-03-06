// Generate a random password and put it in private
const fs = require("fs");
const private = require("../private");
private.dailyPassword = Math.random().toString(36).slice(-10);
fs.writeFileSync(`${__dirname}/../private.json`, JSON.stringify(private, null, 2), "utf8");

// Remove all confirmation PDFs
const dir = `${__dirname}/../confirmations/`;
fs.readdir(dir, (err, files) => {
  if (err) throw err;

  for (const file of files) {
    if (file.split(".").pop() === "pdf") {
      fs.unlink(`${dir}${file}`, (err) => {
        if (err) throw err;
      });
    }
  }
});
