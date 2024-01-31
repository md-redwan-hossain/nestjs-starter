/* eslint-disable */
const fs = require("fs");
const path = require("path");
/* eslint-enable */

const envExamplePath = path.join(__dirname, ".env.example");
const envMigratorExamplePath = path.join(__dirname, ".env.migrator.example");
const envDevPath = path.join(__dirname, ".env.dev");
const envProdPath = path.join(__dirname, ".env.prod");
const envMigratorPath = path.join(__dirname, ".env.migrator");

function envFileScaffolder() {
  if (fs.existsSync(envExamplePath) && fs.existsSync(envMigratorExamplePath)) {
    if (!fs.existsSync(envDevPath)) {
      fs.copyFileSync(envExamplePath, ".env.dev");
    }

    if (!fs.existsSync(envProdPath)) {
      fs.copyFileSync(envExamplePath, ".env.prod");
    }

    if (!fs.existsSync(envMigratorPath)) {
      fs.copyFileSync(envMigratorExamplePath, ".env.migrator");
    }
  }
  console.log("Done");
}

envFileScaffolder();
